import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const REQUIRED_TASK_FIELDS = [
  'bukti_pembayaran_drive_id',
  'task_ktm_drive_id',
  'task_cv_drive_id',
  'task_repost_drive_id',
  'task_broadcast_drive_id',
  'task_twibbon_drive_id',
  'task_follow_ig_drive_id',
  'task_follow_li_drive_id',
] as const

const TASK_LABELS: Record<(typeof REQUIRED_TASK_FIELDS)[number], string> = {
  bukti_pembayaran_drive_id: 'Proof of Payment',
  task_ktm_drive_id: 'KTM',
  task_cv_drive_id: 'CV',
  task_repost_drive_id: 'Repost Poster',
  task_broadcast_drive_id: 'Share & Broadcast',
  task_twibbon_drive_id: 'Twibbon',
  task_follow_ig_drive_id: 'Follow IG',
  task_follow_li_drive_id: 'Follow LinkedIn',
}

type TeamMemberRecord = {
  profile_id: string
  joined_at: string
  profiles: {
    nama: string | null
    nim: string | null
    asal_universitas: string | null
    major_program: string | null
    instagram_username: string | null
    line_id: string | null
    wa_no: string | null
    email: string | null
  } | null
}

type TeamRecord = {
  id: string
  name: string
  competition: 'BCC' | 'MCC'
  join_code: string
  leader_id: string
  referral_code: string | null
  registration_fee: number | null
  source_of_information: string | null
  created_at: string
  bukti_pembayaran_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
  team_members: TeamMemberRecord[]
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id, name, competition, join_code, leader_id, referral_code, registration_fee,
      source_of_information, created_at,
      bukti_pembayaran_drive_id,
      task_ktm_drive_id, task_cv_drive_id, task_repost_drive_id, task_broadcast_drive_id,
      task_twibbon_drive_id, task_follow_ig_drive_id, task_follow_li_drive_id,
      team_members (
        profile_id,
        joined_at,
        profiles (
          nama, nim, asal_universitas, major_program,
          instagram_username, line_id, wa_no, email
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/teams] DB query failed:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }

  const teams = ((data ?? []) as unknown as TeamRecord[]).map(team => {
    const taskStatuses = REQUIRED_TASK_FIELDS.map(field => ({
      key: field,
      label: TASK_LABELS[field],
      complete: hasValue(team[field]),
    }))
    const completedTaskCount = taskStatuses.filter(task => task.complete).length

    return {
      id: team.id,
      name: team.name,
      competition: team.competition,
      join_code: team.join_code,
      referral_code: team.referral_code,
      registration_fee: team.registration_fee,
      source_of_information: team.source_of_information,
      created_at: team.created_at,
      paid: hasValue(team.bukti_pembayaran_drive_id),
      complete: completedTaskCount === REQUIRED_TASK_FIELDS.length,
      completedTaskCount,
      requiredTaskCount: REQUIRED_TASK_FIELDS.length,
      members: (team.team_members ?? [])
        .map(member => ({
          profile_id: member.profile_id,
          joined_at: member.joined_at,
          is_leader: member.profile_id === team.leader_id,
          nama: member.profiles?.nama ?? '',
          nim: member.profiles?.nim ?? '',
          asal_universitas: member.profiles?.asal_universitas ?? '',
          major_program: member.profiles?.major_program ?? '',
          instagram_username: member.profiles?.instagram_username ?? '',
          line_id: member.profiles?.line_id ?? '',
          wa_no: member.profiles?.wa_no ?? '',
          email: member.profiles?.email ?? '',
        }))
        .sort((a, b) => Number(b.is_leader) - Number(a.is_leader)),
      taskStatuses,
    }
  })

  const stats = {
    totalTeams: teams.length,
    paidTeams: teams.filter(team => team.paid).length,
    unpaidTeams: teams.filter(team => !team.paid).length,
    completeTeams: teams.filter(team => team.complete).length,
  }

  return NextResponse.json({ teams, stats })
}
