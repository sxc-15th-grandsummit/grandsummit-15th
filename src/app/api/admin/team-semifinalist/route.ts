import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type Body = {
  teamId?: unknown
  isSemifinalist?: unknown
}

function parseBody(value: Body | null) {
  if (!value) return null
  if (typeof value.teamId !== 'string' || typeof value.isSemifinalist !== 'boolean') return null
  return { teamId: value.teamId, isSemifinalist: value.isSemifinalist }
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = parseBody(await request.json().catch(() => null))
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: team, error: fetchError } = await supabase
    .from('teams')
    .select('id, competition')
    .eq('id', body.teamId)
    .single()

  if (fetchError || !team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  if (team.competition !== 'BCC') {
    return NextResponse.json({ error: 'Only BCC teams can be semifinalists' }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from('teams')
    .update({ is_semifinalist: body.isSemifinalist })
    .eq('id', body.teamId)

  if (updateError) {
    console.error('[admin/team-semifinalist] Update failed:', updateError)
    return NextResponse.json({ error: 'Failed to update semifinalist status' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, is_semifinalist: body.isSemifinalist })
}
