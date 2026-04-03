import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, competition } = await request.json()
  if (!name?.trim() || !competition) {
    return NextResponse.json({ error: 'Missing name or competition' }, { status: 400 })
  }

  const supabase = await createClient()

  // Find team where user is leader
  const { data: team } = await supabase
    .from('teams')
    .select('id, leader_id')
    .eq('competition', competition)
    .eq('leader_id', user.id)
    .single()

  if (!team) {
    return NextResponse.json({ error: 'Only the team leader can rename the team' }, { status: 403 })
  }

  const { error } = await supabase
    .from('teams')
    .update({ name: name.trim() })
    .eq('id', team.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
