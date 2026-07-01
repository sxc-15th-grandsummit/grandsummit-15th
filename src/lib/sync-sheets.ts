import { createClient } from '@/lib/supabase/server'
import { BCC_SHEET_COLUMNS, syncSheet } from '@/lib/google/sheets'
import { getDriveFileCreatedTime, getDriveViewUrl } from '@/lib/google/drive'
import { getBccEffectiveRegistrationFee } from '@/lib/referral-codes'
import { getSubmissionRoundConfig, isSubmissionRoundLate } from '@/lib/submissions'

/**
 * Syncs all team registrations to Google Sheets.
 * Safe to call fire-and-forget (errors are caught and logged).
 */
export async function syncTeamsToSheets(): Promise<{ bccRows: number; mccRows: number }> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) return { bccRows: 0, mccRows: 0 }

  try {
    const supabase = await createClient()
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        joined_at, profile_id,
        profiles (id, email, nama, nim, asal_universitas, major_program, instagram_username, line_id, wa_no),
        teams (id, name, competition, join_code, leader_id,
          bukti_pembayaran_drive_id, bukti_follow_drive_id,
          task_ktm_drive_id, task_cv_drive_id, task_repost_drive_id, task_broadcast_drive_id, task_twibbon_drive_id,
          task_follow_ig_drive_id, task_follow_li_drive_id,
          source_of_information, referral_code, registration_fee, payment_uploaded_at, is_semifinalist)
      `)
      .order('joined_at')

    if (error) {
      console.error('[sync-sheets] DB query failed:', error)
      return { bccRows: 0, mccRows: 0 }
    }

    // Only sync teams that have completed ALL requirements (every drive_id field is filled)
    const REQUIRED_FIELDS = [
      'bukti_pembayaran_drive_id',
      'task_ktm_drive_id',
      'task_cv_drive_id',
      'task_repost_drive_id',
      'task_broadcast_drive_id',
      'task_twibbon_drive_id',
      'task_follow_ig_drive_id',
      'task_follow_li_drive_id',
    ]
    function isTeamComplete(t: Record<string, unknown>): boolean {
      return REQUIRED_FIELDS.every(field => {
        const value = t[field]
        return value !== null && value !== undefined && String(value).trim() !== ''
      })
    }

    const completeMembers = (members ?? []).filter(m => {
      const t = (m as Record<string, unknown>).teams as Record<string, unknown>
      return isTeamComplete(t)
    })

    console.log(`[sync-sheets] Filtered ${(members ?? []).length} total members → ${completeMembers.length} complete members`)

    // Fetch leader emails
    const leaderIds = [...new Set(completeMembers.map(m => ((m as Record<string, unknown>).teams as Record<string, unknown>).leader_id as string).filter(Boolean))]
    const leaderEmailMap = new Map<string, string>()
    if (leaderIds.length > 0) {
      const { data: leaders } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', leaderIds)
      for (const l of leaders ?? []) {
        if (l.id && l.email) leaderEmailMap.set(l.id, l.email)
      }
    }

    const driveUrl = (id: string | null) =>
      id ? (id.startsWith('supabase:') ? '(supabase storage)' : getDriveViewUrl(id)) : ''

    const completeTeamIds = [...new Set(completeMembers
      .map(m => ((m as Record<string, unknown>).teams as Record<string, unknown>).id as string)
      .filter(Boolean))]
    const roundSubmissionsByRound = new Map<string, Map<string, {
      submittedAt: string
      urls: Record<string, string>
    }>>()

    async function loadRoundSubmissions(round: 'preliminary' | 'semifinal') {
      const config = getSubmissionRoundConfig('BCC', round)
      const byTeamId = new Map<string, {
        submittedAt: string
        urls: Record<string, string>
      }>()
      if (completeTeamIds.length === 0 || !config) {
        roundSubmissionsByRound.set(round, byTeamId)
        return
      }
      const [{ data: submissionRows }, { data: roundRows }] = await Promise.all([
        supabase
          .from('team_submissions')
          .select('team_id, requirement_key, drive_file_id')
          .in('team_id', completeTeamIds)
          .eq('competition', 'BCC')
          .eq('round', round),
        supabase
          .from('team_submission_rounds')
          .select('team_id, submitted_at')
          .in('team_id', completeTeamIds)
          .eq('competition', 'BCC')
          .eq('round', round),
      ])

      for (const row of roundRows ?? []) {
        byTeamId.set(row.team_id as string, {
          submittedAt: (row.submitted_at as string | null) ?? '',
          urls: {},
        })
      }

      for (const row of submissionRows ?? []) {
        const teamId = row.team_id as string
        const state = byTeamId.get(teamId) ?? { submittedAt: '', urls: {} }
        state.urls[row.requirement_key as string] = driveUrl(row.drive_file_id as string | null)
        byTeamId.set(teamId, state)
      }

      roundSubmissionsByRound.set(round, byTeamId)
    }

    await Promise.all([
      loadRoundSubmissions('preliminary'),
      loadRoundSubmissions('semifinal'),
    ])

    const bccRows: string[][] = []
    const mccRows: string[][] = []

    for (const m of completeMembers) {
      const t = (m as Record<string, unknown>).teams as Record<string, unknown>
      const p = (m as Record<string, unknown>).profiles as Record<string, unknown>
      const teamId = t.id as string
      const userId = p.id as string
      const leaderId = t.leader_id as string
      const isLeader = userId === leaderId
      const paymentDriveId = t.bukti_pembayaran_drive_id as string | null
      const paymentUploadedAt = (t.payment_uploaded_at as string | null) ?? (paymentDriveId
        ? await getDriveFileCreatedTime(paymentDriveId).catch((err) => {
          console.error('[sync-sheets] Failed to read payment upload time:', err)
          return null
        })
        : null)
      const registrationFee = t.competition === 'BCC'
        ? getBccEffectiveRegistrationFee({
          hasReferralCode: Boolean(t.referral_code),
          paid: Boolean(paymentDriveId),
          paymentUploadedAt,
          storedRegistrationFee: t.registration_fee as number | null,
        })
        : t.registration_fee
      const row = [
        p.email ?? '',
        leaderEmailMap.get(leaderId) ?? '',
        isLeader ? 'Leader' : 'Member',
        t.name, t.competition, t.join_code,
        p.nama, p.nim, p.asal_universitas, p.major_program, p.instagram_username, p.line_id, p.wa_no,
        driveUrl(t.bukti_pembayaran_drive_id as string | null),
        driveUrl(t.task_ktm_drive_id as string | null),
        driveUrl(t.task_cv_drive_id as string | null),
        driveUrl(t.task_repost_drive_id as string | null),
        driveUrl(t.task_broadcast_drive_id as string | null),
        driveUrl(t.task_twibbon_drive_id as string | null),
        driveUrl(t.task_follow_ig_drive_id as string | null),
        driveUrl(t.task_follow_li_drive_id as string | null),
        t.source_of_information ?? '',
        t.referral_code ?? '',
        registrationFee ?? '',
        m.joined_at,
      ].map(v => String(v ?? ''))
      if (t.competition === 'BCC') {
        const preliminary = roundSubmissionsByRound.get('preliminary')?.get(teamId)
        const semifinal = roundSubmissionsByRound.get('semifinal')?.get(teamId)
        bccRows.push([
          ...row,
          preliminary?.urls.essay ?? '',
          preliminary?.urls.originality_statement ?? '',
          preliminary?.urls.ai_usage_declaration ?? '',
          preliminary?.submittedAt
            ? isSubmissionRoundLate('BCC', 'preliminary', preliminary.submittedAt) ? 'Late' : 'On Time'
            : '',
          preliminary?.submittedAt ?? '',
          t.is_semifinalist ? 'Yes' : 'No',
          semifinal?.urls.proposal ?? '',
          semifinal?.urls.originality_statement ?? '',
          semifinal?.urls.ai_usage_declaration ?? '',
          semifinal?.submittedAt
            ? isSubmissionRoundLate('BCC', 'semifinal', semifinal.submittedAt) ? 'Late' : 'On Time'
            : '',
          semifinal?.submittedAt ?? '',
        ])
      }
      else mccRows.push(row)
    }

    await syncSheet(spreadsheetId, 'BCC', bccRows, BCC_SHEET_COLUMNS)
    await syncSheet(spreadsheetId, 'MCC', mccRows)

    return { bccRows: bccRows.length, mccRows: mccRows.length }
  } catch (err) {
    console.error('[sync-sheets] Sync failed:', err)
    return { bccRows: 0, mccRows: 0 }
  }
}
