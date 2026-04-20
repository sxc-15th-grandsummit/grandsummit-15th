import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { syncTeamsToSheets } from '@/lib/sync-sheets'
import { isProfileComplete } from '@/lib/profile'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { join_code?: unknown; competition?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { join_code, competition } = body

  if (!join_code || typeof join_code !== 'string' || !['BCC', 'MCC'].includes(competition as string)) {
    return NextResponse.json({ error: 'Invalid join code or competition' }, { status: 400 })
  }

  const comp = competition as string
  const code = join_code as string

  // Normalize: trim + uppercase
  const normalizedCode = code.trim().toUpperCase()

  const supabase = await createClient()

  // Check profile is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_complete, nama, nim, asal_universitas, major_program, instagram_username, line_id, wa_no')
    .eq('id', user.id)
    .single()
  if (!isProfileComplete(profile)) {
    return NextResponse.json({ error: 'Profile incomplete' }, { status: 403 })
  }

  // Check registration is open
  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', `${comp.toLowerCase()}_registration_open`)
    .single()

  if (setting?.value !== 'true') {
    return NextResponse.json({ error: 'Registration is closed' }, { status: 403 })
  }

  // Find team by join code
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('join_code', normalizedCode)
    .single()

  if (!team) {
    return NextResponse.json({ error: 'Team not found. Check your join code.' }, { status: 404 })
  }

  if (team.competition !== comp) {
    return NextResponse.json({ error: 'This code is for a different competition.' }, { status: 400 })
  }

  // Check member count
  const { count } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', team.id)

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'This team is already full (3 members).' }, { status: 409 })
  }

  // Check user not already in a team for this competition
  // NOTE: Use .filter() for nested relation columns — more reliable than .eq() with dot notation
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('id, teams!inner(competition)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', comp)
    .maybeSingle()

  if (existingMembership) {
    return NextResponse.json({ error: 'You are already in a team for this competition.' }, { status: 409 })
  }

  // Insert team_member
  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, profile_id: user.id })

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })

  syncTeamsToSheets().catch(() => {})
  return NextResponse.json({ team })
}
