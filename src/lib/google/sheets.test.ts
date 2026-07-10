import { describe, expect, test } from 'bun:test'
import { BCC_SHEET_COLUMNS, MCC_SHEET_COLUMNS } from './sheets'

describe('BCC sheet columns', () => {
  test('exports both preliminary and semifinal submission status columns', () => {
    expect(BCC_SHEET_COLUMNS).toContain('Preliminary Submission Status')
    expect(BCC_SHEET_COLUMNS).toContain('Preliminary Submitted At')
    expect(BCC_SHEET_COLUMNS).toContain('Proposal Submission')
    expect(BCC_SHEET_COLUMNS).toContain('Semifinal Submission Status')
    expect(BCC_SHEET_COLUMNS).toContain('Semifinal Submitted At')
  })
})

describe('MCC sheet columns', () => {
  test('exports preliminary pitch deck submission status columns', () => {
    expect(MCC_SHEET_COLUMNS).toContain('Pitch Deck Submission')
    expect(MCC_SHEET_COLUMNS).toContain('MCC Preliminary Submission Status')
    expect(MCC_SHEET_COLUMNS).toContain('MCC Preliminary Submitted At')
  })
})
