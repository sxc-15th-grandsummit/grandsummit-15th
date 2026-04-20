import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { new_leader_id, competition } = await request.json()
  if (!new_leader_id || !competition) {
    return NextResponse.json({ error: 'Missing new_leader_id or competition' }, { status: 400 })
  }

  const supabase = await createClient()

  // Only current leader can transfer leadership
  const { data: team } = await supabase
    .from('teams')
    .select('id, leader_id')
    .eq('competition', competition)
    .eq('leader_id', user.id)
    .single()

  if (!team) {
    return NextResponse.json({ error: 'Only the team leader can transfer leadership' }, { status: 403 })
  }

  // Verify new leader is a team member
  const { data: membership } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', team.id)
    .eq('profile_id', new_leader_id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'New leader must be a team member' }, { status: 400 })
  }

  const { error } = await supabase
    .from('teams')
    .update({ leader_id: new_leader_id })
    .eq('id', team.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
