import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createFolder, deleteFolder } from '@/lib/google/drive'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0, O, I, 1

function generateJoinCode(): string {
  let code = 'GS-'
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: unknown; competition?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { name, competition } = body

  if (!name || typeof name !== 'string' || !name.trim() || !['BCC', 'MCC'].includes(competition as string)) {
    return NextResponse.json({ error: 'Invalid team name or competition' }, { status: 400 })
  }

  const teamName = (name as string).trim()
  const comp = competition as string
  const supabase = await createClient()

  // Check profile is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_complete')
    .eq('id', user.id)
    .single()
  if (!profile?.is_complete) {
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

  // Check user not already in a team for this competition
  // NOTE: Use .filter() for nested relation columns — more reliable than .eq() with dot notation
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('id, teams!inner(competition)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', comp)
    .maybeSingle()

  if (existingMembership) {
    return NextResponse.json({ error: 'You are already in a team for this competition' }, { status: 409 })
  }

  // Generate unique join code (up to 5 attempts)
  let joinCode = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateJoinCode()
    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .eq('join_code', candidate)
      .maybeSingle()
    if (!existing) { joinCode = candidate; break }
  }

  if (!joinCode) {
    return NextResponse.json({ error: 'Could not generate a unique team code, please try again' }, { status: 500 })
  }

  // Step 1: Insert teams row (without drive_folder_id)
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name: teamName, competition: comp, join_code: joinCode, leader_id: user.id })
    .select()
    .single()

  if (teamError) {
    if (teamError.code === '23505') {
      return NextResponse.json({ error: 'Team name already taken for this competition' }, { status: 409 })
    }
    return NextResponse.json({ error: teamError.message }, { status: 500 })
  }

  // Step 2: Create Drive folder
  const parentFolderId = comp === 'BCC'
    ? process.env.BCC_DRIVE_FOLDER_ID
    : process.env.MCC_DRIVE_FOLDER_ID

  if (!parentFolderId) {
    return NextResponse.json({ error: 'Server misconfiguration: Drive folder not configured' }, { status: 500 })
  }

  let driveFolderId: string
  try {
    driveFolderId = await createFolder(`${comp}-${teamName}`, parentFolderId)
  } catch (err) {
    // Rollback: delete teams row
    const { error: rollbackErr } = await supabase.from('teams').delete().eq('id', team.id)
    if (rollbackErr) console.error('Rollback delete failed (step 2):', rollbackErr)
    console.error('Drive folder creation failed:', err)
    return NextResponse.json({ error: 'Failed to create team folder, please try again' }, { status: 500 })
  }

  // Step 3: Update teams row with drive_folder_id
  const { error: updateError } = await supabase
    .from('teams')
    .update({ drive_folder_id: driveFolderId })
    .eq('id', team.id)

  if (updateError) {
    const { error: rollbackErr } = await supabase.from('teams').delete().eq('id', team.id)
    if (rollbackErr) console.error('Rollback delete failed (step 3):', rollbackErr)
    await deleteFolder(driveFolderId)
    return NextResponse.json({ error: 'Internal error, please try again' }, { status: 500 })
  }

  // Step 4: Insert team_members row for leader
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, profile_id: user.id })

  if (memberError) {
    const { error: rollbackErr } = await supabase.from('teams').delete().eq('id', team.id)
    if (rollbackErr) console.error('Rollback delete failed (step 4):', rollbackErr)
    await deleteFolder(driveFolderId)
    return NextResponse.json({ error: 'Internal error, please try again' }, { status: 500 })
  }

  return NextResponse.json({
    team: { ...team, drive_folder_id: driveFolderId },
  })
}
