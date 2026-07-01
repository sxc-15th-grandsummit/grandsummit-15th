import { describe, expect, test } from 'bun:test'
import { shouldShowTeamInAdminRegistry } from './admin-team-filters'

describe('admin team filters', () => {
  test('semifinalist-only filter shows only BCC semifinalist teams', () => {
    expect(shouldShowTeamInAdminRegistry({
      competition: 'BCC',
      is_semifinalist: true,
    }, { semifinalistsOnly: true })).toBe(true)

    expect(shouldShowTeamInAdminRegistry({
      competition: 'BCC',
      is_semifinalist: false,
    }, { semifinalistsOnly: true })).toBe(false)

    expect(shouldShowTeamInAdminRegistry({
      competition: 'MCC',
      is_semifinalist: true,
    }, { semifinalistsOnly: true })).toBe(false)
  })

  test('semifinalist-only filter is inactive when disabled', () => {
    expect(shouldShowTeamInAdminRegistry({
      competition: 'MCC',
      is_semifinalist: false,
    }, { semifinalistsOnly: false })).toBe(true)
  })
})
