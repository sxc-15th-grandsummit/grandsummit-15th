import { describe, expect, test } from 'bun:test'
import { BCC_SHEET_COLUMNS } from './sheets'

describe('BCC sheet columns', () => {
  test('exports both preliminary and semifinal submission status columns', () => {
    expect(BCC_SHEET_COLUMNS).toContain('Preliminary Submission Status')
    expect(BCC_SHEET_COLUMNS).toContain('Preliminary Submitted At')
    expect(BCC_SHEET_COLUMNS).toContain('Proposal Submission')
    expect(BCC_SHEET_COLUMNS).toContain('Semifinal Submission Status')
    expect(BCC_SHEET_COLUMNS).toContain('Semifinal Submitted At')
  })
})
