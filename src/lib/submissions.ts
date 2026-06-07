export const BCC_PRELIMINARY_DEADLINE = '2026-06-07T23:59:00+07:00'
export const BCC_PRELIMINARY_LATE_AT = '2026-06-08T00:30:00+07:00'
export const BCC_PRELIMINARY_SUBMISSION_CLOSE_AT = '2026-06-08T01:00:00+07:00'

export type SubmissionRequirementKey =
  | 'essay'
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
  competition: 'BCC'
  round: 'preliminary'
  label: string
  deadline: string
  lateAt: string
  closeAt: string
  guidebookUrl: string
  requirements: SubmissionRequirement[]
}

const PDF_ONLY = ['application/pdf']
export const BCC_PRELIMINARY_MAX_BYTES = 20 * 1024 * 1024

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
  lateAt: BCC_PRELIMINARY_LATE_AT,
  closeAt: BCC_PRELIMINARY_SUBMISSION_CLOSE_AT,
  guidebookUrl: 'https://drive.google.com/drive/folders/1LhbLaP1W1x-wecUtsq-lCrDsGOrIRoR_',
  requirements: BCC_PRELIMINARY_REQUIREMENTS,
}

export function getSubmissionRoundConfig(
  competition: string,
  round: string,
): SubmissionRoundConfig | null {
  if (competition === 'BCC' && round === 'preliminary') {
    return BCC_PRELIMINARY_CONFIG
  }

  return null
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

  return new Date(submittedAt).getTime() >= new Date(config.lateAt).getTime()
}
