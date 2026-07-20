import { describe, expect, test } from 'bun:test'
import { shouldShowTeamInAdminRegistry } from './admin-team-filters'

describe('admin team filters', () => {
  test('semifinalist-only filter shows only BCC semifinalist teams', () => {
    expect(shouldShowTeamInAdminRegistry({
      competition: 'BCC',
      is_semifinalist: true,
      is_finalist: false,
    }, { semifinalistsOnly: true, finalistsOnly: false })).toBe(true)

    expect(shouldShowTeamInAdminRegistry({
      competition: 'BCC',
      is_semifinalist: false,
      is_finalist: false,
    }, { semifinalistsOnly: true, finalistsOnly: false })).toBe(false)

    expect(shouldShowTeamInAdminRegistry({
      competition: 'MCC',
      is_semifinalist: true,
      is_finalist: false,
    }, { semifinalistsOnly: true, finalistsOnly: false })).toBe(false)
  })

  test('semifinalist-only filter is inactive when disabled', () => {
    expect(shouldShowTeamInAdminRegistry({
      competition: 'MCC',
      is_semifinalist: false,
      is_finalist: false,
    }, { semifinalistsOnly: false, finalistsOnly: false })).toBe(true)
  })

  test('finalist-only filter shows only BCC finalist teams', () => {
    expect(shouldShowTeamInAdminRegistry({
      competition: 'BCC',
      is_semifinalist: true,
      is_finalist: true,
    }, { semifinalistsOnly: false, finalistsOnly: true })).toBe(true)

    expect(shouldShowTeamInAdminRegistry({
      competition: 'BCC',
      is_semifinalist: true,
      is_finalist: false,
    }, { semifinalistsOnly: false, finalistsOnly: true })).toBe(false)

    expect(shouldShowTeamInAdminRegistry({
      competition: 'MCC',
      is_semifinalist: false,
      is_finalist: true,
    }, { semifinalistsOnly: false, finalistsOnly: true })).toBe(false)
  })
})
