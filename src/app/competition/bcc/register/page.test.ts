import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('BCC finalist submission tab', () => {
  test('shows the final round only for finalist teams', () => {
    expect(source).toContain("type DashTab = 'myteam' | 'task' | 'essay' | 'proposal' | 'final'")
    expect(source).toContain('{myTeam.is_finalist && (')
    expect(source).toContain('Final Submission')
    expect(source).toContain('<SubmissionRound round="final"')
  })
})
