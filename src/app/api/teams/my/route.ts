import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBccEffectiveRegistrationFee } from '@/lib/referral-codes'
import { getDriveFileCreatedTime, getDriveViewUrl } from '@/lib/google/drive'
import { getSubmissionRoundConfig, type SubmissionRoundConfig } from '@/lib/submissions'

type TeamMemberRecord = {
  profile_id: string
  profiles: {
    nama: string | null
    asal_universitas: string | null
  } | null
}

type TeamRecord = {
  id: string
  name: string
  competition: string
  join_code: string
  leader_id: string
  source_of_information: string | null
  referral_code: string | null
  registration_fee: number | null
  payment_uploaded_at: string | null
  bukti_pembayaran_drive_id: string | null
  bukti_follow_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
  team_members: TeamMemberRecord[]
}

type SubmissionItemRecord = {
  requirement_key: string
  drive_file_id: string | null
  storage_path: string | null
  original_filename: string | null
  mime_type: string | null
  size_bytes: number | null
  uploaded_at: string
  updated_at: string
}

type SubmissionRoundRecord = {
  submitted_at: string | null
}

type SubmissionItem = SubmissionItemRecord & {
  url: string | null
}

type TeamResponse = {
  id: string
  name: string
  competition: string
  join_code: string
  leader_id: string
  source_of_information: string | null
  referral_code: string | null
  registration_fee: number | null
  bukti_pembayaran_drive_id: string | null
  bukti_follow_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
  members: Array<{
    profile_id: string
    nama: string | null
    asal_universitas: string | null
  }>
  submissions?: {
    preliminary: {
      config: SubmissionRoundConfig
      items: SubmissionItem[]
      submitted_at: string | null
      deadline: string
    }
  }
}

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
        id, name, competition, join_code, leader_id,
        source_of_information, referral_code, registration_fee, payment_uploaded_at,
        bukti_pembayaran_drive_id, bukti_follow_drive_id,
        task_ktm_drive_id, task_cv_drive_id,
        task_repost_drive_id, task_broadcast_drive_id, task_twibbon_drive_id,
        task_follow_ig_drive_id, task_follow_li_drive_id,
        team_members (
          profile_id,
          profiles (nama, asal_universitas)
        )
      )
    `)
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) return NextResponse.json({ team: null })

  const t = (membership as unknown as { teams: TeamRecord }).teams
  const members = t.team_members
    .map(tm => ({ profile_id: tm.profile_id, ...tm.profiles }))
    .filter(member => member.nama)
  const paid = Boolean(t.bukti_pembayaran_drive_id)
  const paymentUploadedAt = t.payment_uploaded_at ?? (paid && t.bukti_pembayaran_drive_id
    ? await getDriveFileCreatedTime(t.bukti_pembayaran_drive_id).catch((err) => {
      console.error(`[teams/my] Failed to read payment upload time for team ${t.id}:`, err)
      return null
    })
    : null)
  const registrationFee = t.competition === 'BCC'
    ? getBccEffectiveRegistrationFee({
      hasReferralCode: Boolean(t.referral_code),
      paid,
      paymentUploadedAt,
      storedRegistrationFee: t.registration_fee,
    })
    : t.registration_fee

  let submissions: TeamResponse['submissions']
  const preliminaryConfig = getSubmissionRoundConfig(t.competition, 'preliminary')
  if (t.competition === 'BCC' && preliminaryConfig) {
    const [{ data: submissionRows }, { data: submissionRound }] = await Promise.all([
      supabase
        .from('team_submissions')
        .select(`
          requirement_key,
          drive_file_id,
          storage_path,
          original_filename,
          mime_type,
          size_bytes,
          uploaded_at,
          updated_at
        `)
        .eq('team_id', t.id)
        .eq('competition', 'BCC')
        .eq('round', 'preliminary'),
      supabase
        .from('team_submission_rounds')
        .select('submitted_at')
        .eq('team_id', t.id)
        .eq('competition', 'BCC')
        .eq('round', 'preliminary')
        .maybeSingle(),
    ])

    const items = ((submissionRows ?? []) as SubmissionItemRecord[]).map((item) => ({
      ...item,
      url: item.drive_file_id ? getDriveViewUrl(item.drive_file_id) : null,
    }))

    submissions = {
      preliminary: {
        config: preliminaryConfig,
        items,
        submitted_at: (submissionRound as SubmissionRoundRecord | null)?.submitted_at ?? null,
        deadline: preliminaryConfig.deadline,
      },
    }
  }

  const team: TeamResponse = {
    id: t.id,
    name: t.name,
    competition: t.competition,
    join_code: t.join_code,
    leader_id: t.leader_id,
    source_of_information: t.source_of_information,
    referral_code: t.referral_code,
    registration_fee: registrationFee,
    bukti_pembayaran_drive_id: t.bukti_pembayaran_drive_id,
    bukti_follow_drive_id: t.bukti_follow_drive_id,
    task_ktm_drive_id: t.task_ktm_drive_id,
    task_cv_drive_id: t.task_cv_drive_id,
    task_repost_drive_id: t.task_repost_drive_id,
    task_broadcast_drive_id: t.task_broadcast_drive_id,
    task_twibbon_drive_id: t.task_twibbon_drive_id,
    task_follow_ig_drive_id: t.task_follow_ig_drive_id,
    task_follow_li_drive_id: t.task_follow_li_drive_id,
    members,
  }

  if (submissions) {
    team.submissions = submissions
  }

  return NextResponse.json({
    team,
    current_user_id: user.id,
  })
}
