import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createClient()

  const [
    { count: bccTeams, error: e1 },
    { count: mccTeams, error: e2 },
    { count: totalMembers, error: e3 },
    { data: settings, error: e4 },
  ] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }).eq('competition', 'BCC'),
    supabase.from('teams').select('*', { count: 'exact', head: true }).eq('competition', 'MCC'),
    supabase.from('team_members').select('*', { count: 'exact', head: true }),
    supabase.from('settings').select('key, value').in('key', ['bcc_registration_open', 'mcc_registration_open']),
  ])

  const dbError = e1 ?? e2 ?? e3 ?? e4
  if (dbError) {
    console.error('[admin/stats] DB query failed:', dbError)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }

  const map = Object.fromEntries((settings ?? []).map(r => [r.key, r.value]))

  return NextResponse.json({
    stats: { bccTeams: bccTeams ?? 0, mccTeams: mccTeams ?? 0, totalMembers: totalMembers ?? 0 },
    regOpen: {
      bcc: map['bcc_registration_open'] === 'true',
      mcc: map['mcc_registration_open'] === 'true',
    },
  })
}
