import { createResumableUploadSession } from '@/lib/google/drive'
import { canAccessMccPitchDeckSubmission, getSubmissionRequirement, isSubmissionRoundExpired } from '@/lib/submissions'
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type UploadSessionBody = {
  competition?: unknown
  round?: unknown
  requirement_key?: unknown
  filename?: unknown
  mime_type?: unknown
  size_bytes?: unknown
}

type TeamRecord = {
  id: string
  competition: string
  join_code: string
  drive_folder_id: string | null
  bukti_pembayaran_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
}

type ExistingSubmissionRecord = {
  drive_file_id: string | null
}

type SubmissionRoundRecord = {
  submitted_at: string | null
}

function parseBody(value: UploadSessionBody | null) {
  if (!value) return null
  const { competition, round, requirement_key: requirementKey, filename, mime_type: mimeType, size_bytes: sizeBytes } = value

  if (
    typeof competition !== 'string' ||
    typeof round !== 'string' ||
    typeof requirementKey !== 'string' ||
    typeof filename !== 'string' ||
    typeof mimeType !== 'string' ||
    typeof sizeBytes !== 'number'
  ) {
    return null
  }

  return { competition, round, requirementKey, filename, mimeType, sizeBytes }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = parseBody(await request.json().catch(() => null))
  if (!body) return NextResponse.json({ error: 'Invalid upload session request' }, { status: 400 })

  const requirement = getSubmissionRequirement(body.competition, body.round, body.requirementKey)
  if (!requirement) return NextResponse.json({ error: 'Invalid submission requirement' }, { status: 400 })

  if (isSubmissionRoundExpired(body.competition, body.round)) {
    return NextResponse.json({ error: 'Submission deadline has passed' }, { status: 400 })
  }

  if (!requirement.allowedTypes.includes(body.mimeType)) {
    return NextResponse.json({ error: `Invalid file type. Allowed: ${requirement.allowedTypes.join(', ')}` }, { status: 400 })
  }
  if (body.sizeBytes <= 0) return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  if (body.sizeBytes > requirement.maxBytes) {
    return NextResponse.json({ error: `File too large. Max: ${requirement.maxBytes / 1024 / 1024}MB` }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: membership } = await supabase
    .from('team_members')
    .select(`
      team_id,
      teams!inner(
        id, competition, join_code, drive_folder_id, bukti_pembayaran_drive_id,
        task_ktm_drive_id, task_cv_drive_id, task_repost_drive_id, task_broadcast_drive_id,
        task_twibbon_drive_id, task_follow_ig_drive_id, task_follow_li_drive_id
      )
    `)
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', body.competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  const team = (membership as unknown as { teams: TeamRecord }).teams
  if (!team.drive_folder_id) {
    return NextResponse.json({ error: 'Team does not have a Drive folder. Please contact admin.' }, { status: 500 })
  }
  if (body.competition === 'MCC' && body.round === 'preliminary' && !canAccessMccPitchDeckSubmission(team)) {
    return NextResponse.json({ error: 'Complete all MCC registration tasks before uploading the pitch deck' }, { status: 403 })
  }

  const { data: submissionRound } = await supabase
    .from('team_submission_rounds')
    .select('submitted_at')
    .eq('team_id', team.id)
    .eq('competition', body.competition)
    .eq('round', body.round)
    .maybeSingle()

  if ((submissionRound as SubmissionRoundRecord | null)?.submitted_at) {
    return NextResponse.json({ error: 'Submission has already been finalized' }, { status: 400 })
  }

  const { data: existingSubmission } = await supabase
    .from('team_submissions')
    .select('drive_file_id')
    .eq('team_id', team.id)
    .eq('competition', body.competition)
    .eq('round', body.round)
    .eq('requirement_key', body.requirementKey)
    .maybeSingle()

  const existingDriveId = (existingSubmission as ExistingSubmissionRecord | null)?.drive_file_id
  const fileName = `${body.requirementKey}_${body.round}_${team.id}`

  const uploadUrl = await createResumableUploadSession({
    name: fileName,
    mimeType: body.mimeType,
    sizeBytes: body.sizeBytes,
    folderId: team.drive_folder_id,
    existingFileId: existingDriveId && !existingDriveId.startsWith('supabase:') ? existingDriveId : null,
    origin: request.headers.get('origin'),
  })

  return NextResponse.json({ uploadUrl })
}
