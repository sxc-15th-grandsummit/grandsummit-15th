import { describe, expect, test } from 'bun:test'
import {
  BCC_FINAL_DEADLINE,
  BCC_FINAL_MAX_BYTES,
  BCC_FINAL_SUBMISSION_CLOSE_AT,
  BCC_PRELIMINARY_DEADLINE,
  BCC_PRELIMINARY_SUBMISSION_CLOSE_AT,
  BCC_SEMIFINAL_MAX_BYTES,
  BCC_SEMIFINAL_DEADLINE,
  BCC_SEMIFINAL_SUBMISSION_CLOSE_AT,
  MCC_PRELIMINARY_DEADLINE,
  MCC_PRELIMINARY_SUBMISSION_CLOSE_AT,
  canAccessBccFinalSubmission,
  canAccessMccPitchDeckSubmission,
  getSubmissionRequirement,
  getSubmissionRoundConfig,
  isSubmissionRoundComplete,
  isSubmissionRoundExpired,
  isSubmissionRoundLate,
} from './submissions'

describe('BCC final submissions', () => {
  test('defines the three final requirements, resources, filenames, and deadline', () => {
    const config = getSubmissionRoundConfig('BCC', 'final')

    expect(config?.label).toBe('Final')
    expect(config?.deadline).toBe(BCC_FINAL_DEADLINE)
    expect(config?.closeAt).toBe(BCC_FINAL_SUBMISSION_CLOSE_AT)
    expect(config?.resourceLinks).toEqual([
      { label: 'Final Stage Guideline', url: 'https://bit.ly/FinalStageGuidebook' },
      { label: 'Final Case', url: 'https://bit.ly/FinalCaseDocument' },
    ])
    expect(config?.requirements.map((requirement) => requirement.key)).toEqual([
      'pitch_deck',
      'originality_statement',
      'ai_usage_declaration',
    ])
    expect(config?.requirements.every((requirement) => requirement.maxBytes === BCC_FINAL_MAX_BYTES)).toBe(true)
    expect(config?.requirements.map((requirement) => requirement.expectedFileName)).toEqual([
      'PitchDeckBCC_15GrandSummit_[Team Name].pdf',
      '[Team Name]_Originality_Final_BCC.pdf',
      '[Team Name]_AIDeclaration_Final_BCC.pdf',
    ])
  })

  test('stays open through the grace period and marks submissions late at the deadline', () => {
    expect(isSubmissionRoundExpired('BCC', 'final', new Date('2026-07-23T17:59:59.000Z'))).toBe(false)
    expect(isSubmissionRoundExpired('BCC', 'final', new Date('2026-07-23T18:00:00.000Z'))).toBe(true)
    expect(isSubmissionRoundLate('BCC', 'final', '2026-07-23T16:58:59.000Z')).toBe(false)
    expect(isSubmissionRoundLate('BCC', 'final', '2026-07-23T16:59:00.000Z')).toBe(true)
  })

  test('requires every final file and finalist eligibility', () => {
    expect(isSubmissionRoundComplete('BCC', 'final', [
      'pitch_deck',
      'originality_statement',
      'ai_usage_declaration',
    ])).toBe(true)
    expect(isSubmissionRoundComplete('BCC', 'final', ['pitch_deck'])).toBe(false)
    expect(canAccessBccFinalSubmission({ is_finalist: true })).toBe(true)
    expect(canAccessBccFinalSubmission({ is_finalist: false })).toBe(false)
  })
})

describe('BCC preliminary submissions', () => {
  test('defines BCC preliminary requirements and deadline', () => {
    const config = getSubmissionRoundConfig('BCC', 'preliminary')

    expect(config?.deadline).toBe(BCC_PRELIMINARY_DEADLINE)
    expect(config?.closeAt).toBe(BCC_PRELIMINARY_SUBMISSION_CLOSE_AT)
    expect(config?.label).toBe('Preliminary')
    expect(config?.requirements.map((requirement) => requirement.key)).toEqual([
      'essay',
      'originality_statement',
      'ai_usage_declaration',
    ])
    expect(config?.requirements[0].maxBytes).toBe(20 * 1024 * 1024)
    expect(config?.requirements[0].expectedFileName).toBe('[Team Name]_Essay_Preliminary_BCC.pdf')
    expect(config?.requirements[1].maxBytes).toBe(20 * 1024 * 1024)
    expect(config?.requirements[1].expectedFileName).toBe('[Team Name]_Originality_Preliminary_BCC.pdf')
    expect(config?.requirements[2].maxBytes).toBe(20 * 1024 * 1024)
    expect(config?.requirements[2].expectedFileName).toBe('[Team Name]_AIDeclaration_Preliminary_BCC.pdf')
  })

  test('finds the essay requirement with PDF-only upload settings', () => {
    const requirement = getSubmissionRequirement('BCC', 'preliminary', 'essay')

    expect(requirement?.label).toBe('Essay Submission')
    expect(requirement?.allowedTypes).toEqual(['application/pdf'])
  })

  test('requires all three submission keys before the round is complete', () => {
    expect(isSubmissionRoundComplete('BCC', 'preliminary', [
      'essay',
      'originality_statement',
      'ai_usage_declaration',
    ])).toBe(true)

    expect(isSubmissionRoundComplete('BCC', 'preliminary', [
      'essay',
      'originality_statement',
    ])).toBe(false)
  })

  test('expires at the BCC preliminary deadline instant', () => {
    expect(isSubmissionRoundExpired(
      'BCC',
      'preliminary',
      new Date('2026-06-07T17:59:59.000Z'),
    )).toBe(false)
    expect(isSubmissionRoundExpired(
      'BCC',
      'preliminary',
      new Date('2026-06-07T18:00:00.000Z'),
    )).toBe(true)
  })

  test('marks BCC preliminary submissions after the display deadline as late', () => {
    expect(isSubmissionRoundLate('BCC', 'preliminary', '2026-06-07T16:58:59.000Z')).toBe(false)
    expect(isSubmissionRoundLate('BCC', 'preliminary', '2026-06-07T16:59:00.000Z')).toBe(true)
    expect(isSubmissionRoundLate('BCC', 'preliminary', null)).toBe(false)
  })

  test('defines BCC semifinal requirements and deadline', () => {
    const config = getSubmissionRoundConfig('BCC', 'semifinal')

    expect(config?.deadline).toBe(BCC_SEMIFINAL_DEADLINE)
    expect(config?.closeAt).toBe(BCC_SEMIFINAL_SUBMISSION_CLOSE_AT)
    expect(config?.label).toBe('Semifinal')
    expect(config?.requirements.map((requirement) => requirement.key)).toEqual([
      'proposal',
      'originality_statement',
      'ai_usage_declaration',
    ])
    expect(config?.requirements.every((requirement) => requirement.maxBytes === BCC_SEMIFINAL_MAX_BYTES)).toBe(true)
    expect(BCC_SEMIFINAL_MAX_BYTES).toBe(30 * 1024 * 1024)
  })

  test('keeps BCC semifinal open until the close instant and marks late after deadline', () => {
    expect(isSubmissionRoundExpired(
      'BCC',
      'semifinal',
      new Date('2026-07-02T17:59:59.000Z'),
    )).toBe(false)
    expect(isSubmissionRoundExpired(
      'BCC',
      'semifinal',
      new Date('2026-07-02T18:00:00.000Z'),
    )).toBe(true)
    expect(isSubmissionRoundLate('BCC', 'semifinal', '2026-07-02T16:58:59.000Z')).toBe(false)
    expect(isSubmissionRoundLate('BCC', 'semifinal', '2026-07-02T16:59:00.000Z')).toBe(true)
  })

  test('treats unknown rounds as expired', () => {
    expect(isSubmissionRoundExpired('BCC', 'unknown')).toBe(true)
  })
})

describe('MCC preliminary submissions', () => {
  test('defines MCC preliminary requirements without essay', () => {
    const config = getSubmissionRoundConfig('MCC', 'preliminary')

    expect(config?.deadline).toBe(MCC_PRELIMINARY_DEADLINE)
    expect(config?.closeAt).toBe(MCC_PRELIMINARY_SUBMISSION_CLOSE_AT)
    expect(config?.label).toBe('Pitch Deck')
    expect(config?.requirements.map((requirement) => requirement.key)).toEqual([
      'pitch_deck',
      'originality_statement',
      'ai_usage_declaration',
    ])
    expect(config?.requirements[0].expectedFileName).toBe('PitchDeckMCC_15GrandSummit_[Team Name].pdf')
    expect(config?.requirements[0].allowedTypes).toEqual(['application/pdf'])
    expect(config?.requirements[1].expectedFileName).toBe('[Team Name]_Originality_MCC.pdf')
    expect(config?.requirements[2].expectedFileName).toBe('[Team Name]_AIDeclaration_MCC.pdf')
  })

  test('keeps MCC pitch deck open until 11 July 01:00 WIB and marks late after 10 July 23:59 WIB', () => {
    expect(isSubmissionRoundExpired(
      'MCC',
      'preliminary',
      new Date('2026-07-10T17:59:59.000Z'),
    )).toBe(false)
    expect(isSubmissionRoundExpired(
      'MCC',
      'preliminary',
      new Date('2026-07-10T18:00:00.000Z'),
    )).toBe(true)
    expect(isSubmissionRoundLate('MCC', 'preliminary', '2026-07-10T16:58:59.000Z')).toBe(false)
    expect(isSubmissionRoundLate('MCC', 'preliminary', '2026-07-10T16:59:00.000Z')).toBe(true)
  })

  test('allows GS-FPVS to access pitch deck submission before registration tasks are complete', () => {
    const incompleteTeam = {
      join_code: 'GS-FPVS',
      bukti_pembayaran_drive_id: null,
      task_ktm_drive_id: null,
      task_cv_drive_id: null,
      task_repost_drive_id: null,
      task_broadcast_drive_id: null,
      task_twibbon_drive_id: null,
      task_follow_ig_drive_id: null,
      task_follow_li_drive_id: null,
    }

    expect(canAccessMccPitchDeckSubmission(incompleteTeam)).toBe(true)
    expect(canAccessMccPitchDeckSubmission({ ...incompleteTeam, join_code: 'GS-OTHER' })).toBe(false)
  })
})
