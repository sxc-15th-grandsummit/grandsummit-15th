import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const competition = searchParams.get('competition')
  if (!competition) return NextResponse.json({ team: null })

  const supabase = await createClient()

  // NOTE: Use .filter() for nested relation columns
  const { data: membership } = await supabase
    .from('team_members')
    .select(`
      teams!inner (
        id, name, competition, join_code,
        bukti_pembayaran_drive_id, bukti_follow_drive_id,
        team_members (
          profiles (nama, asal_universitas)
        )
      )
    `)
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) return NextResponse.json({ team: null })

  const t = (membership as any).teams
  const members = t.team_members.map((tm: any) => tm.profiles).filter(Boolean)

  return NextResponse.json({
    team: {
      id: t.id,
      name: t.name,
      competition: t.competition,
      join_code: t.join_code,
      bukti_pembayaran_drive_id: t.bukti_pembayaran_drive_id,
      bukti_follow_drive_id: t.bukti_follow_drive_id,
      members,
    }
  })
}
