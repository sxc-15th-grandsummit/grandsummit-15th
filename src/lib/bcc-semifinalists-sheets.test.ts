import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

const syncSource = readFileSync(new URL('./sync-sheets.ts', import.meta.url), 'utf8')
const sheetSource = readFileSync(new URL('./google/sheets.ts', import.meta.url), 'utf8')

describe('BCC semifinalists Sheets export', () => {
  test('writes one BCC semifinalist row per team to its own tab', () => {
    expect(sheetSource).toContain('BCC_SEMIFINALISTS_SHEET_COLUMNS')
    expect(syncSource).toContain("syncSheet(spreadsheetId, 'BCC Semifinalists', bccSemifinalistRows, BCC_SEMIFINALISTS_SHEET_COLUMNS)")
    expect(syncSource).toContain(".eq('competition', 'BCC')")
    expect(syncSource).toContain(".eq('is_semifinalist', true)")
  })
})
