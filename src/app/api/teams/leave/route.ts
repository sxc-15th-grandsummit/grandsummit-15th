import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { competition } = await request.json()
  if (!competition) return NextResponse.json({ error: 'Missing competition' }, { status: 400 })

  const supabase = await createClient()

  // Find team membership
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(id, competition, leader_id)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 404 })
  }

  const team = (membership as any).teams

  // If user is the leader, check if there are other members
  if (team.leader_id === user.id) {
    const { count } = await supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', membership.team_id)

    if ((count ?? 0) > 1) {
      return NextResponse.json(
        { error: 'Transfer leadership before leaving, or remove other members first' },
        { status: 400 }
      )
    }

    // Last member (leader) — delete the entire team
    await supabase.from('teams').delete().eq('id', membership.team_id)
    return NextResponse.json({ ok: true })
  }

  // Non-leader: just remove from team_members
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', membership.team_id)
    .eq('profile_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
