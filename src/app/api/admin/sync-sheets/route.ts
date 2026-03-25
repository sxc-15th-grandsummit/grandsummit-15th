import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { syncSheet } from '@/lib/google/sheets'
import { getDriveViewUrl } from '@/lib/google/drive'
import { NextResponse } from 'next/server'

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { data: members, error } = await supabase
    .from('team_members')
    .select(`
      joined_at,
      profiles (nama, nim, asal_universitas, major_program, instagram_username),
      teams (name, competition, join_code, bukti_pembayaran_drive_id, bukti_follow_drive_id)
    `)
    .order('joined_at')

  if (error) {
    console.error('[admin/sync-sheets] DB query failed:', error)
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) {
    return NextResponse.json({ error: 'GOOGLE_SHEET_ID not configured' }, { status: 500 })
  }

  const bccRows: string[][] = []
  const mccRows: string[][] = []

  for (const m of members ?? []) {
    const t = (m as any).teams
    const p = (m as any).profiles
    const row = [
      t.name, t.competition, t.join_code,
      p.nama, p.nim, p.asal_universitas, p.major_program, p.instagram_username,
      t.bukti_pembayaran_drive_id ? getDriveViewUrl(t.bukti_pembayaran_drive_id) : '',
      t.bukti_follow_drive_id ? getDriveViewUrl(t.bukti_follow_drive_id) : '',
      m.joined_at,
    ].map(v => String(v ?? ''))  // guard against null values
    if (t.competition === 'BCC') bccRows.push(row)
    else mccRows.push(row)
  }
  await syncSheet(spreadsheetId, 'BCC', bccRows)
  await syncSheet(spreadsheetId, 'MCC', mccRows)

  return NextResponse.json({ ok: true, bccRows: bccRows.length, mccRows: mccRows.length })
}
