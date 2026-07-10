import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('admin MCC submission display', () => {
  test('labels MCC preliminary submissions separately from BCC submissions', () => {
    expect(source).toContain("team.competition === 'MCC' ? 'MCC Pitch Deck' : 'BCC Submissions'")
    expect(source).toContain("statusFilter === 'MCC_PRELIM_SUBMITTED'")
    expect(source).toContain('MCC pitch deck submitted')
    expect(source).not.toContain('Not required for MCC.')
    expect(source).not.toContain('<option value="PRELIM_SUBMITTED">Prelim submitted</option>')
  })
})
