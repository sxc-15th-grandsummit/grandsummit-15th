import { createClient } from '@/lib/supabase/server'
import { syncSheet } from '@/lib/google/sheets'
import { getDriveViewUrl } from '@/lib/google/drive'

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
        teams (name, competition, join_code,
          bukti_pembayaran_drive_id, bukti_follow_drive_id,
          task_ktm_drive_id, task_repost_drive_id, task_broadcast_drive_id, task_twibbon_drive_id,
          task_follow_ig_drive_id, task_follow_li_drive_id)
      `)
      .order('joined_at')

    if (error) {
      console.error('[sync-sheets] DB query failed:', error)
      return { bccRows: 0, mccRows: 0 }
    }

    const driveUrl = (id: string | null) =>
      id ? (id.startsWith('supabase:') ? '(supabase storage)' : getDriveViewUrl(id)) : ''

    const bccRows: string[][] = []
    const mccRows: string[][] = []

    for (const m of members ?? []) {
      const t = (m as Record<string, unknown>).teams as Record<string, unknown>
      const p = (m as Record<string, unknown>).profiles as Record<string, unknown>
      const row = [
        p.email ?? '',
        t.name, t.competition, t.join_code,
        p.nama, p.nim, p.asal_universitas, p.major_program, p.instagram_username, p.line_id, p.wa_no,
        driveUrl(t.bukti_pembayaran_drive_id as string | null),
        driveUrl(t.bukti_follow_drive_id as string | null),
        driveUrl(t.task_ktm_drive_id as string | null),
        driveUrl(t.task_repost_drive_id as string | null),
        driveUrl(t.task_broadcast_drive_id as string | null),
        driveUrl(t.task_twibbon_drive_id as string | null),
        driveUrl(t.task_follow_ig_drive_id as string | null),
        driveUrl(t.task_follow_li_drive_id as string | null),
        m.joined_at,
      ].map(v => String(v ?? ''))
      if (t.competition === 'BCC') bccRows.push(row)
      else mccRows.push(row)
    }

    await syncSheet(spreadsheetId, 'BCC', bccRows)
    await syncSheet(spreadsheetId, 'MCC', mccRows)

    return { bccRows: bccRows.length, mccRows: mccRows.length }
  } catch (err) {
    console.error('[sync-sheets] Sync failed:', err)
    return { bccRows: 0, mccRows: 0 }
  }
}
