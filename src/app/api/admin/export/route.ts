import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { getDriveViewUrl } from '@/lib/google/drive'

export async function GET() {
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
    console.error('[admin/export] DB query failed:', error)
    return new Response('Internal server error', { status: 500 })
  }

  const BOM = '\uFEFF'
  // Header row: quote each cell the same way as data rows for CSV consistency
  const COLS = ['Team Name', 'Competition', 'Join Code', 'Nama', 'NIM', 'Asal Universitas', 'Major Program', 'Instagram Username', 'Bukti Pembayaran Drive URL', 'Bukti Follow Drive URL', 'Joined At']
  const header = COLS.map(c => `"${c}"`).join(',')

  const rows = (members ?? []).map((m: any) => {
    const t = m.teams
    const p = m.profiles
    const cols = [
      t.name, t.competition, t.join_code,
      p.nama, p.nim, p.asal_universitas, p.major_program, p.instagram_username,
      t.bukti_pembayaran_drive_id ? getDriveViewUrl(t.bukti_pembayaran_drive_id) : '',
      t.bukti_follow_drive_id ? getDriveViewUrl(t.bukti_follow_drive_id) : '',
      m.joined_at,
    ]
    return cols.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  })

  const csv = BOM + [header, ...rows].join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="registrations.csv"',
    },
  })
}
