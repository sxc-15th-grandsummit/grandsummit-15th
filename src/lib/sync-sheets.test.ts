import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

const source = readFileSync(new URL('./sync-sheets.ts', import.meta.url), 'utf8')

describe('syncTeamsToSheets MCC preliminary export', () => {
  test('loads and writes MCC preliminary submission columns', () => {
    expect(source).toContain('MCC_SHEET_COLUMNS')
    expect(source).toContain("loadRoundSubmissions('MCC', 'preliminary')")
    expect(source).toContain("syncSheet(spreadsheetId, 'MCC', mccRows, MCC_SHEET_COLUMNS)")
  })
})
