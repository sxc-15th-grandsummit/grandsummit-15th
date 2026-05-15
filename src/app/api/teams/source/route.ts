import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { source_of_information, competition } = await request.json()
  if (!competition || !['BCC', 'MCC'].includes(competition)) {
    return NextResponse.json({ error: 'Invalid competition' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(id, leader_id, competition)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  const team = membership.teams as unknown as Record<string, unknown>

  const { error } = await supabase
    .from('teams')
    .update({ source_of_information: source_of_information?.trim() || null })
    .eq('id', team.id as string)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
