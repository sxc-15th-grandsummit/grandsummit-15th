import { canAccessMccPitchDeckSubmission, getSubmissionRoundConfig, isSubmissionRoundComplete, isSubmissionRoundExpired } from '@/lib/submissions'
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type SubmitBody = {
  competition?: unknown
  round?: unknown
}

type TeamRecord = {
  id: string
  join_code: string
  bukti_pembayaran_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
}

type SubmissionRoundRecord = {
  submitted_at: string | null
}

type SubmissionRecord = {
  requirement_key: string
  drive_file_id: string | null
}

async function parseSubmitBody(request: Request): Promise<SubmitBody | null> {
  try {
    const body = await request.json()

    return body && typeof body === 'object' ? body as SubmitBody : null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await parseSubmitBody(request)
  const competition = body?.competition
  const round = body?.round

  if (typeof competition !== 'string' || typeof round !== 'string' || !competition || !round) {
    return NextResponse.json({ error: 'Missing competition or round' }, { status: 400 })
  }

  const config = getSubmissionRoundConfig(competition, round)
  if (!config) {
    return NextResponse.json({ error: 'Invalid submission round' }, { status: 400 })
  }

  if (isSubmissionRoundExpired(competition, round)) {
    return NextResponse.json({ error: 'Submission deadline has passed' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('team_members')
    .select(`
      team_id,
      teams!inner(
        id, join_code, bukti_pembayaran_drive_id, task_ktm_drive_id, task_cv_drive_id,
        task_repost_drive_id, task_broadcast_drive_id, task_twibbon_drive_id,
        task_follow_ig_drive_id, task_follow_li_drive_id
      )
    `)
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  const team = (membership as unknown as { teams: TeamRecord }).teams
  if (competition === 'MCC' && round === 'preliminary' && !canAccessMccPitchDeckSubmission(team)) {
    return NextResponse.json({ error: 'Complete all MCC registration tasks before submitting the pitch deck' }, { status: 403 })
  }

  const { data: submissionRound } = await supabase
    .from('team_submission_rounds')
    .select('submitted_at')
    .eq('team_id', team.id)
    .eq('competition', competition)
    .eq('round', round)
    .maybeSingle()

  if ((submissionRound as SubmissionRoundRecord | null)?.submitted_at) {
    return NextResponse.json({ error: 'Submission has already been finalized' }, { status: 400 })
  }

  const { data: submissions } = await supabase
    .from('team_submissions')
    .select('requirement_key, drive_file_id')
    .eq('team_id', team.id)
    .eq('competition', competition)
    .eq('round', round)

  const submittedRequirementKeys = ((submissions ?? []) as SubmissionRecord[])
    .filter((submission) => submission.drive_file_id)
    .map((submission) => submission.requirement_key)

  if (!isSubmissionRoundComplete(competition, round, submittedRequirementKeys)) {
    return NextResponse.json({ error: 'Submission requirements are incomplete' }, { status: 400 })
  }

  const submittedAt = new Date().toISOString()
  const { error: upsertError } = await supabase
    .from('team_submission_rounds')
    .upsert({
      team_id: team.id,
      competition,
      round,
      submitted_at: submittedAt,
      updated_at: submittedAt,
    }, { onConflict: 'team_id,competition,round' })

  if (upsertError) {
    console.error('[Submission Submit] DB upsert failed:', upsertError)
    return NextResponse.json({ error: 'Internal error finalizing submission' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, submitted_at: submittedAt })
}
