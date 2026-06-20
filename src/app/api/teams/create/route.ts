import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createFolder } from '@/lib/google/drive'
import { syncTeamsToSheets } from '@/lib/sync-sheets'
import { isProfileComplete } from '@/lib/profile'
import { normalizeBccReferralCode } from '@/lib/referral-codes.server'
import { getBccRegistrationFee, getMccRegistrationFee } from '@/lib/referral-codes'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0, O, I, 1

function getErrorDetail(err: unknown) {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null) {
    const maybeErrors = (err as { errors?: Array<{ message?: unknown }> }).errors
    const firstMessage = maybeErrors?.[0]?.message
    if (typeof firstMessage === 'string') return firstMessage
  }
  return String(err)
}

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

  let body: { name?: unknown; competition?: unknown; source_of_information?: unknown; referral_code?: unknown; registration_type?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { name, competition, source_of_information, referral_code, registration_type } = body

  if (!['BCC', 'MCC'].includes(competition as string)) {
    return NextResponse.json({ error: 'Invalid competition' }, { status: 400 })
  }

  const comp = competition as string
  const registrationType = registration_type === 'individual' ? 'individual' : 'team'
  if (comp === 'MCC' && registrationType === 'individual') {
    return NextResponse.json({ error: 'MCC registration is only available for teams of 2-3 members' }, { status: 400 })
  }

  if (comp === 'BCC' && (!name || typeof name !== 'string' || !name.trim())) {
    return NextResponse.json({ error: 'Invalid team name' }, { status: 400 })
  }
  if (comp === 'MCC' && (!name || typeof name !== 'string' || !name.trim())) {
    return NextResponse.json({ error: 'Invalid team name' }, { status: 400 })
  }

  const sourceInfo = typeof source_of_information === 'string' ? source_of_information.trim() : null
  const referralCode = normalizeBccReferralCode(referral_code)
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

  const teamName = (name as string).trim()

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

  if (referralCode) {
    if (comp !== 'BCC') {
      return NextResponse.json({ error: 'Referral code is only available for BCC registration' }, { status: 400 })
    }

    const { data: referralConfig, error: referralConfigError } = await supabase
      .from('referral_codes')
      .select('max_uses')
      .eq('competition', 'BCC')
      .eq('code', referralCode)
      .eq('active', true)
      .maybeSingle()

    if (referralConfigError) {
      return NextResponse.json({ error: referralConfigError.message }, { status: 500 })
    }

    if (!referralConfig) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    const { count, error: referralCountError } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('competition', 'BCC')
      .eq('referral_code', referralCode)

    if (referralCountError) {
      return NextResponse.json({ error: referralCountError.message }, { status: 500 })
    }

    if ((count ?? 0) >= referralConfig.max_uses) {
      return NextResponse.json({ error: 'Referral code usage limit has been reached' }, { status: 409 })
    }
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
    .insert({
      name: teamName,
      competition: comp,
      join_code: joinCode,
      leader_id: user.id,
      source_of_information: sourceInfo,
      referral_code: referralCode || null,
      registration_fee: comp === 'BCC'
        ? getBccRegistrationFee(Boolean(referralCode))
        : getMccRegistrationFee(),
    })
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
    await supabase.from('teams').delete().eq('id', team.id)
    return NextResponse.json({ error: 'Server misconfiguration: Drive folder ID not set' }, { status: 500 })
  }

  let driveFolderId: string
  try {
    driveFolderId = await createFolder(`${comp}-${teamName}`, parentFolderId)
  } catch (err: unknown) {
    await supabase.from('teams').delete().eq('id', team.id)
    const detail = getErrorDetail(err)
    console.error('Drive folder creation failed:', detail)
    return NextResponse.json({ error: `Drive error: ${detail}` }, { status: 500 })
  }

  // Step 3: Update teams row with drive_folder_id
  const { error: updateError } = await supabase
    .from('teams')
    .update({ drive_folder_id: driveFolderId })
    .eq('id', team.id)

  if (updateError) {
    await supabase.from('teams').delete().eq('id', team.id)
    return NextResponse.json({ error: 'Internal error, please try again' }, { status: 500 })
  }

  // Step 4: Insert team_members row for leader
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, profile_id: user.id })

  if (memberError) {
    await supabase.from('teams').delete().eq('id', team.id)
    return NextResponse.json({ error: 'Internal error, please try again' }, { status: 500 })
  }

  syncTeamsToSheets().catch(() => {})
  return NextResponse.json({ team: { ...team, drive_folder_id: driveFolderId } })
}
