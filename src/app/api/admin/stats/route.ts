import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createClient()

  const [{ count: bccTeams }, { count: mccTeams }, { count: totalMembers }, { data: settings }] =
    await Promise.all([
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('competition', 'BCC'),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('competition', 'MCC'),
      supabase.from('team_members').select('*', { count: 'exact', head: true }),
      supabase.from('settings').select('key, value').in('key', ['bcc_registration_open', 'mcc_registration_open']),
    ])

  const map = Object.fromEntries((settings ?? []).map(r => [r.key, r.value]))

  return NextResponse.json({
    stats: { bccTeams: bccTeams ?? 0, mccTeams: mccTeams ?? 0, totalMembers: totalMembers ?? 0 },
    regOpen: {
      bcc: map['bcc_registration_open'] === 'true',
      mcc: map['mcc_registration_open'] === 'true',
    },
  })
}
