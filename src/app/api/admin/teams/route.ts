import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBccEffectiveRegistrationFee, getMccRegistrationFee } from '@/lib/referral-codes'
import { getDriveFileCreatedTime, getDriveViewUrl } from '@/lib/google/drive'
import { getSubmissionRoundConfig, isSubmissionRoundLate } from '@/lib/submissions'

const REQUIRED_TASK_FIELDS = [
  'bukti_pembayaran_drive_id',
  'task_ktm_drive_id',
  'task_cv_drive_id',
  'task_repost_drive_id',
  'task_broadcast_drive_id',
  'task_twibbon_drive_id',
  'task_follow_ig_drive_id',
  'task_follow_li_drive_id',
] as const

const TASK_LABELS: Record<(typeof REQUIRED_TASK_FIELDS)[number], string> = {
  bukti_pembayaran_drive_id: 'Proof of Payment',
  task_ktm_drive_id: 'KTM',
  task_cv_drive_id: 'CV',
  task_repost_drive_id: 'Repost Poster',
  task_broadcast_drive_id: 'Share & Broadcast',
  task_twibbon_drive_id: 'Twibbon',
  task_follow_ig_drive_id: 'Follow IG',
  task_follow_li_drive_id: 'Follow LinkedIn',
}

type TeamMemberRecord = {
  profile_id: string
  joined_at: string
  profiles: {
    nama: string | null
    nim: string | null
    asal_universitas: string | null
    major_program: string | null
    instagram_username: string | null
    line_id: string | null
    wa_no: string | null
    email: string | null
  } | null
}

type TeamRecord = {
  id: string
  name: string
  competition: 'BCC' | 'MCC'
  join_code: string
  leader_id: string
  is_semifinalist: boolean
  referral_code: string | null
  registration_fee: number | null
  payment_uploaded_at: string | null
  source_of_information: string | null
  created_at: string
  bukti_pembayaran_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
  team_members: TeamMemberRecord[]
}

type SubmissionRecord = {
  team_id: string
  requirement_key: string
  drive_file_id: string | null
  updated_at: string | null
}

type SubmissionRoundRecord = {
  team_id: string
  submitted_at: string | null
}

type SubmissionRoundState = {
  submittedAt: string | null
  items: Map<string, SubmissionRecord>
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

function driveUrl(id: string | null) {
  if (!id) return null
  return id.startsWith('supabase:') ? null : getDriveViewUrl(id)
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id, name, competition, join_code, leader_id, is_semifinalist, referral_code, registration_fee, payment_uploaded_at,
      source_of_information, created_at,
      bukti_pembayaran_drive_id,
      task_ktm_drive_id, task_cv_drive_id, task_repost_drive_id, task_broadcast_drive_id,
      task_twibbon_drive_id, task_follow_ig_drive_id, task_follow_li_drive_id,
      team_members (
        profile_id,
        joined_at,
        profiles (
          nama, nim, asal_universitas, major_program,
          instagram_username, line_id, wa_no, email
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/teams] DB query failed:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }

  const teamIds = ((data ?? []) as unknown as TeamRecord[]).map(team => team.id)
  const preliminaryConfig = getSubmissionRoundConfig('BCC', 'preliminary')
  const semifinalConfig = getSubmissionRoundConfig('BCC', 'semifinal')
  const submissionsByRound = new Map<string, Map<string, SubmissionRoundState>>()

  async function loadSubmissionRoundStates(round: 'preliminary' | 'semifinal') {
    const config = getSubmissionRoundConfig('BCC', round)
    const byTeamId = new Map<string, SubmissionRoundState>()
    if (teamIds.length === 0 || !config) {
      submissionsByRound.set(round, byTeamId)
      return
    }
    const [{ data: submissionRows }, { data: roundRows }] = await Promise.all([
      supabase
        .from('team_submissions')
        .select('team_id, requirement_key, drive_file_id, updated_at')
        .in('team_id', teamIds)
        .eq('competition', 'BCC')
        .eq('round', round),
      supabase
        .from('team_submission_rounds')
        .select('team_id, submitted_at')
        .in('team_id', teamIds)
        .eq('competition', 'BCC')
        .eq('round', round),
    ])

    for (const row of (roundRows ?? []) as SubmissionRoundRecord[]) {
      byTeamId.set(row.team_id, {
        submittedAt: row.submitted_at,
        items: new Map(),
      })
    }

    for (const row of (submissionRows ?? []) as SubmissionRecord[]) {
      const state = byTeamId.get(row.team_id) ?? {
        submittedAt: null,
        items: new Map<string, SubmissionRecord>(),
      }
      state.items.set(row.requirement_key, row)
      byTeamId.set(row.team_id, state)
    }

    submissionsByRound.set(round, byTeamId)
  }

  await Promise.all([
    loadSubmissionRoundStates('preliminary'),
    loadSubmissionRoundStates('semifinal'),
  ])

  const teams = await Promise.all(((data ?? []) as unknown as TeamRecord[]).map(async team => {
    const paid = hasValue(team.bukti_pembayaran_drive_id)
    const paymentUploadedAt = team.payment_uploaded_at ?? (paid && team.bukti_pembayaran_drive_id
      ? await getDriveFileCreatedTime(team.bukti_pembayaran_drive_id).catch((err) => {
        console.error(`[admin/teams] Failed to read payment upload time for team ${team.id}:`, err)
        return null
      })
      : null)
    const taskStatuses = REQUIRED_TASK_FIELDS.map(field => ({
      key: field,
      label: TASK_LABELS[field],
      complete: hasValue(team[field]),
    }))
    const completedTaskCount = taskStatuses.filter(task => task.complete).length
    const registrationFee = team.competition === 'BCC'
      ? getBccEffectiveRegistrationFee({
        hasReferralCode: hasValue(team.referral_code),
        paid,
        paymentUploadedAt,
        storedRegistrationFee: team.registration_fee,
      })
      : paid
        ? team.registration_fee
        : getMccRegistrationFee(new Date(team.created_at))
    const preliminaryState = team.competition === 'BCC' && preliminaryConfig
      ? submissionsByRound.get('preliminary')?.get(team.id) ?? { submittedAt: null, items: new Map<string, SubmissionRecord>() }
      : null
    const semifinalState = team.competition === 'BCC' && semifinalConfig
      ? submissionsByRound.get('semifinal')?.get(team.id) ?? { submittedAt: null, items: new Map<string, SubmissionRecord>() }
      : null
    const preliminaryStatuses = preliminaryConfig && preliminaryState
      ? preliminaryConfig.requirements.map(requirement => {
        const item = preliminaryState.items.get(requirement.key)
        return {
          key: requirement.key,
          label: requirement.label,
          complete: hasValue(item?.drive_file_id),
          url: driveUrl(item?.drive_file_id ?? null),
          updated_at: item?.updated_at ?? null,
        }
      })
      : []
    const semifinalStatuses = semifinalConfig && semifinalState
      ? semifinalConfig.requirements.map(requirement => {
        const item = semifinalState.items.get(requirement.key)
        return {
          key: requirement.key,
          label: requirement.label,
          complete: hasValue(item?.drive_file_id),
          url: driveUrl(item?.drive_file_id ?? null),
          updated_at: item?.updated_at ?? null,
        }
      })
      : []
    const preliminaryCompletedCount = preliminaryStatuses.filter(status => status.complete).length
    const semifinalCompletedCount = semifinalStatuses.filter(status => status.complete).length

    return {
      id: team.id,
      name: team.name,
      competition: team.competition,
      join_code: team.join_code,
      is_semifinalist: team.is_semifinalist,
      referral_code: team.referral_code,
      registration_fee: registrationFee,
      source_of_information: team.source_of_information,
      created_at: team.created_at,
      paid,
      complete: completedTaskCount === REQUIRED_TASK_FIELDS.length,
      completedTaskCount,
      requiredTaskCount: REQUIRED_TASK_FIELDS.length,
      preliminarySubmitted: Boolean(preliminaryState?.submittedAt),
      preliminarySubmittedAt: preliminaryState?.submittedAt ?? null,
      preliminaryLate: isSubmissionRoundLate('BCC', 'preliminary', preliminaryState?.submittedAt),
      preliminaryCompletedCount,
      preliminaryRequiredCount: preliminaryConfig && team.competition === 'BCC' ? preliminaryConfig.requirements.length : 0,
      preliminaryStatuses,
      semifinalSubmitted: Boolean(semifinalState?.submittedAt),
      semifinalSubmittedAt: semifinalState?.submittedAt ?? null,
      semifinalLate: isSubmissionRoundLate('BCC', 'semifinal', semifinalState?.submittedAt),
      semifinalCompletedCount,
      semifinalRequiredCount: semifinalConfig && team.competition === 'BCC' && team.is_semifinalist ? semifinalConfig.requirements.length : 0,
      semifinalStatuses: team.is_semifinalist ? semifinalStatuses : [],
      members: (team.team_members ?? [])
        .map(member => ({
          profile_id: member.profile_id,
          joined_at: member.joined_at,
          is_leader: member.profile_id === team.leader_id,
          nama: member.profiles?.nama ?? '',
          nim: member.profiles?.nim ?? '',
          asal_universitas: member.profiles?.asal_universitas ?? '',
          major_program: member.profiles?.major_program ?? '',
          instagram_username: member.profiles?.instagram_username ?? '',
          line_id: member.profiles?.line_id ?? '',
          wa_no: member.profiles?.wa_no ?? '',
          email: member.profiles?.email ?? '',
        }))
        .sort((a, b) => Number(b.is_leader) - Number(a.is_leader)),
      taskStatuses,
    }
  }))

  const stats = {
    totalTeams: teams.length,
    paidTeams: teams.filter(team => team.paid).length,
    unpaidTeams: teams.filter(team => !team.paid).length,
    completeTeams: teams.filter(team => team.complete).length,
    collectedAmount: teams
      .filter(team => team.paid)
      .reduce((total, team) => total + (team.registration_fee ?? 0), 0),
    bccCollectedAmount: teams
      .filter(team => team.paid && team.competition === 'BCC')
      .reduce((total, team) => total + (team.registration_fee ?? 0), 0),
    mccCollectedAmount: teams
      .filter(team => team.paid && team.competition === 'MCC')
      .reduce((total, team) => total + (team.registration_fee ?? 0), 0),
  }

  return NextResponse.json({ teams, stats })
}
