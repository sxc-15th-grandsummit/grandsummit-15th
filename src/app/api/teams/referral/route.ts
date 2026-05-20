import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBccRegistrationFee, isBccExtendedRegistration } from '@/lib/referral-codes'
import { normalizeBccReferralCode } from '@/lib/referral-codes.server'

type TeamRecord = {
  id: string
  competition: string
  leader_id: string
  bukti_pembayaran_drive_id: string | null
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { competition?: unknown; referral_code?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const competition = body.competition
  const referralCode = normalizeBccReferralCode(body.referral_code)

  if (competition !== 'BCC') {
    return NextResponse.json({ error: 'Referral code is only available for BCC registration' }, { status: 400 })
  }

  if (!referralCode) {
    return NextResponse.json({ error: 'Missing referral code' }, { status: 400 })
  }

  if (isBccExtendedRegistration()) {
    return NextResponse.json({ error: 'Referral code is not available during extended registration' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(id, competition, leader_id, bukti_pembayaran_drive_id)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  const team = (membership as unknown as { teams: TeamRecord }).teams

  if (team.leader_id !== user.id) {
    return NextResponse.json({ error: 'Only the team leader can apply a referral code' }, { status: 403 })
  }

  if (team.bukti_pembayaran_drive_id) {
    return NextResponse.json({ error: 'Referral code cannot be changed after proof of payment is uploaded' }, { status: 409 })
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
    .neq('id', team.id)

  if (referralCountError) {
    return NextResponse.json({ error: referralCountError.message }, { status: 500 })
  }

  if ((count ?? 0) >= referralConfig.max_uses) {
    return NextResponse.json({ error: 'Referral code usage limit has been reached' }, { status: 409 })
  }

  const registrationFee = getBccRegistrationFee(true)
  const { error: updateError } = await supabase
    .from('teams')
    .update({ referral_code: referralCode, registration_fee: registrationFee })
    .eq('id', team.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, referral_code: referralCode, registration_fee: registrationFee })
}
