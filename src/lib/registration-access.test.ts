import { describe, expect, test } from 'bun:test'
import { canAccessRegisteredTeam } from './registration-access'

describe('canAccessRegisteredTeam', () => {
  test('allows registered teams while registration is open', () => {
    expect(canAccessRegisteredTeam({
      registrationOpen: true,
      paid: false,
    })).toBe(true)
  })

  test('blocks unpaid teams after registration closes', () => {
    expect(canAccessRegisteredTeam({
      registrationOpen: false,
      paid: false,
    })).toBe(false)
  })

  test('allows paid teams after registration closes', () => {
    expect(canAccessRegisteredTeam({
      registrationOpen: false,
      paid: true,
    })).toBe(true)
  })
})
