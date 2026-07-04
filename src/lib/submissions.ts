export const BCC_PRELIMINARY_DEADLINE = '2026-06-07T23:59:00+07:00'
export const BCC_PRELIMINARY_SUBMISSION_CLOSE_AT = '2026-06-08T01:00:00+07:00'

export const BCC_SEMIFINAL_DEADLINE = '2026-07-02T23:59:00+07:00'
export const BCC_SEMIFINAL_SUBMISSION_CLOSE_AT = '2026-07-03T01:00:00+07:00'

export const MCC_PRELIMINARY_DEADLINE = '2026-07-10T23:59:00+07:00'
export const MCC_PRELIMINARY_SUBMISSION_CLOSE_AT = '2026-07-11T01:00:00+07:00'

export type SubmissionRequirementKey =
  | 'essay'
  | 'pitch_deck'
  | 'proposal'
  | 'originality_statement'
  | 'ai_usage_declaration'

export type SubmissionRequirement = {
  key: SubmissionRequirementKey
  label: string
  description: string
  expectedFileName: string
  allowedTypes: string[]
  accept: string
  maxBytes: number
}

export type SubmissionRoundConfig = {
  competition: 'BCC' | 'MCC'
  round: string
  label: string
  deadline: string
  closeAt: string
  guidebookUrl: string
  caseLinkUrl?: string
  proposalGuidelineUrl?: string
  resourceLinks?: Array<{ label: string; url: string }>
  requirements: SubmissionRequirement[]
}

const PDF_ONLY = ['application/pdf']
export const BCC_PRELIMINARY_MAX_BYTES = 20 * 1024 * 1024
export const BCC_SEMIFINAL_MAX_BYTES = 30 * 1024 * 1024
export const MCC_PRELIMINARY_MAX_BYTES = 30 * 1024 * 1024

const BCC_PRELIMINARY_REQUIREMENTS: SubmissionRequirement[] = [
  {
    key: 'essay',
    label: 'Essay Submission',
    description: 'Submit your preliminary essay in PDF format.',
    expectedFileName: '[Team Name]_Essay_Preliminary_BCC.pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: BCC_PRELIMINARY_MAX_BYTES,
  },
  {
    key: 'originality_statement',
    label: 'Originality Statement',
    description: 'Upload your signed originality statement as one PDF file.',
    expectedFileName: '[Team Name]_Originality_Preliminary_BCC.pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: BCC_PRELIMINARY_MAX_BYTES,
  },
  {
    key: 'ai_usage_declaration',
    label: 'AI Usage Declaration',
    description: 'Upload your signed AI usage declaration as one PDF file.',
    expectedFileName: '[Team Name]_AIDeclaration_Preliminary_BCC.pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: BCC_PRELIMINARY_MAX_BYTES,
  },
]

const BCC_PRELIMINARY_CONFIG: SubmissionRoundConfig = {
  competition: 'BCC',
  round: 'preliminary',
  label: 'Preliminary',
  deadline: BCC_PRELIMINARY_DEADLINE,
  closeAt: BCC_PRELIMINARY_SUBMISSION_CLOSE_AT,
  guidebookUrl: 'https://drive.google.com/drive/folders/1LhbLaP1W1x-wecUtsq-lCrDsGOrIRoR_',
  requirements: BCC_PRELIMINARY_REQUIREMENTS,
}

const BCC_SEMIFINAL_REQUIREMENTS: SubmissionRequirement[] = [
  {
    key: 'proposal',
    label: 'Proposal Submission',
    description:
      'Upload your team\'s proposal in PDF format. The proposal should provide a more detailed explanation than the essay, including in-depth analysis, strategic justification, and feasibility considerations based on the given case.',
    expectedFileName: 'Proposal_BCC_15GrandSummit.pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: BCC_SEMIFINAL_MAX_BYTES,
  },
  {
    key: 'originality_statement',
    label: 'Originality Statement',
    description:
      'Upload your team\'s signed Originality Statement as one PDF file. Template is available in the guidebook. Compile into one PDF and sign by all team members. Maximum similarity index is 60%.',
    expectedFileName: '[Team Name]_Originality_SF.pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: BCC_SEMIFINAL_MAX_BYTES,
  },
  {
    key: 'ai_usage_declaration',
    label: 'AI Usage Declaration',
    description:
      'Upload your team\'s signed AI Usage Declaration as one PDF file. Template is available in the guidebook. Compile into one PDF and sign by all team members. AI tools are allowed only as assisting tools; submissions that are mostly AI-generated will be disqualified.',
    expectedFileName: '[Team Name]_AIDeclaration_SF.pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: BCC_SEMIFINAL_MAX_BYTES,
  },
]

const BCC_SEMIFINAL_CONFIG: SubmissionRoundConfig = {
  competition: 'BCC',
  round: 'semifinal',
  label: 'Semifinal',
  deadline: BCC_SEMIFINAL_DEADLINE,
  closeAt: BCC_SEMIFINAL_SUBMISSION_CLOSE_AT,
  guidebookUrl: 'https://drive.google.com/drive/folders/1yLQQbIlL3VczHWkyzvtgc-NSR_acE_d9',
  caseLinkUrl: 'https://drive.google.com/drive/folders/1mlGsTo_ejYBqT56tGaRHBnCP94MQCGtJ',
  proposalGuidelineUrl: 'https://drive.google.com/drive/folders/1yLQQbIlL3VczHWkyzvtgc-NSR_acE_d9',
  requirements: BCC_SEMIFINAL_REQUIREMENTS,
}

const MCC_PRELIMINARY_REQUIREMENTS: SubmissionRequirement[] = [
  {
    key: 'pitch_deck',
    label: 'Pitch Deck Submission',
    description:
      'Upload your team\'s pitch deck in PDF format. Use 16:9 landscape orientation, maximum 10 content slides excluding cover, references, and appendices. Put page numbers on the bottom-right of every slide except the cover, and place the Lezza case collaborator logo and SxC Grand Summit logo on the top-right of every slide.',
    expectedFileName: 'PitchDeckMCC_15GrandSummit_[Team Name].pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: MCC_PRELIMINARY_MAX_BYTES,
  },
  {
    key: 'originality_statement',
    label: 'Originality Statement',
    description:
      'Upload your team\'s signed Originality Statement as one PDF file. Template is available in the guidebook.',
    expectedFileName: '[Team Name]_Originality_MCC.pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: MCC_PRELIMINARY_MAX_BYTES,
  },
  {
    key: 'ai_usage_declaration',
    label: 'AI Usage Declaration',
    description:
      'Upload your team\'s signed AI Usage Declaration as one PDF file. Template is available in the guidebook.',
    expectedFileName: '[Team Name]_AIDeclaration_MCC.pdf',
    allowedTypes: PDF_ONLY,
    accept: '.pdf',
    maxBytes: MCC_PRELIMINARY_MAX_BYTES,
  },
]

const MCC_PRELIMINARY_CONFIG: SubmissionRoundConfig = {
  competition: 'MCC',
  round: 'preliminary',
  label: 'Pitch Deck',
  deadline: MCC_PRELIMINARY_DEADLINE,
  closeAt: MCC_PRELIMINARY_SUBMISSION_CLOSE_AT,
  guidebookUrl: 'https://bit.ly/GuidebookMCCGS15',
  caseLinkUrl: 'https://drive.google.com/drive/folders/1kT7VMsVD1ZRCh3Nmxcyb3DgVYegna0g9',
  resourceLinks: [
    { label: 'Pitchdeck Guideline', url: 'https://drive.google.com/drive/folders/1r2oq1HLJUFlN42sKQB0FF4YRpjJ_0085' },
    { label: 'Guidebook MCC', url: 'https://bit.ly/GuidebookMCCGS15' },
    { label: 'Case Document', url: 'https://drive.google.com/drive/folders/1kT7VMsVD1ZRCh3Nmxcyb3DgVYegna0g9' },
  ],
  requirements: MCC_PRELIMINARY_REQUIREMENTS,
}

export function getSubmissionRoundConfig(
  competition: string,
  round: string,
): SubmissionRoundConfig | null {
  if (competition === 'BCC' && round === 'preliminary') {
    return BCC_PRELIMINARY_CONFIG
  }
  if (competition === 'BCC' && round === 'semifinal') {
    return BCC_SEMIFINAL_CONFIG
  }
  if (competition === 'MCC' && round === 'preliminary') {
    return MCC_PRELIMINARY_CONFIG
  }

  return null
}

export type MccRegistrationTaskState = {
  join_code?: string | null
  bukti_pembayaran_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
}

export function isMccRegistrationTaskComplete(team: MccRegistrationTaskState): boolean {
  return Boolean(
    team.bukti_pembayaran_drive_id &&
    team.task_ktm_drive_id &&
    team.task_cv_drive_id &&
    team.task_repost_drive_id &&
    team.task_broadcast_drive_id &&
    team.task_twibbon_drive_id &&
    team.task_follow_ig_drive_id &&
    team.task_follow_li_drive_id,
  )
}

export function canAccessMccPitchDeckSubmission(team: MccRegistrationTaskState): boolean {
  return team.join_code === 'GS-FPVS' || isMccRegistrationTaskComplete(team)
}

export function getSubmissionRequirement(
  competition: string,
  round: string,
  requirementKey: string,
): SubmissionRequirement | null {
  const config = getSubmissionRoundConfig(competition, round)

  return config?.requirements.find((requirement) => requirement.key === requirementKey) ?? null
}

export function isSubmissionRoundComplete(
  competition: string,
  round: string,
  submittedRequirementKeys: string[],
): boolean {
  const config = getSubmissionRoundConfig(competition, round)

  if (!config) {
    return false
  }

  const submittedKeys = new Set(submittedRequirementKeys)

  return config.requirements.every((requirement) => submittedKeys.has(requirement.key))
}

export function isSubmissionRoundExpired(
  competition: string,
  round: string,
  now = new Date(),
): boolean {
  const config = getSubmissionRoundConfig(competition, round)

  if (!config) {
    return true
  }

  return now.getTime() >= new Date(config.closeAt).getTime()
}

export function isSubmissionRoundLate(
  competition: string,
  round: string,
  submittedAt: string | null | undefined,
): boolean {
  const config = getSubmissionRoundConfig(competition, round)
  if (!config || !submittedAt) {
    return false
  }

  return new Date(submittedAt).getTime() >= new Date(config.deadline).getTime()
}
