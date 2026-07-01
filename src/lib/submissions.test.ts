import { describe, expect, test } from 'bun:test'
import {
  BCC_PRELIMINARY_DEADLINE,
  BCC_PRELIMINARY_SUBMISSION_CLOSE_AT,
  BCC_SEMIFINAL_DEADLINE,
  BCC_SEMIFINAL_SUBMISSION_CLOSE_AT,
  getSubmissionRequirement,
  getSubmissionRoundConfig,
  isSubmissionRoundComplete,
  isSubmissionRoundExpired,
  isSubmissionRoundLate,
} from './submissions'

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
