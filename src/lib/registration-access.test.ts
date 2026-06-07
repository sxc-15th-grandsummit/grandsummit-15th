import { describe, expect, test } from 'bun:test'
import { canAccessRegisteredTeam, getRegistrationCta } from './registration-access'

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

  test('allows existing unpaid teams after registration closes', () => {
    expect(canAccessRegisteredTeam({
      registrationOpen: false,
      paid: false,
      hasExistingTeam: true,
    })).toBe(true)
  })
})

describe('getRegistrationCta', () => {
  test('shows team dashboard CTA for existing teams after registration closes', () => {
    expect(getRegistrationCta({
      registrationOpen: false,
      hasExistingTeam: true,
    })).toEqual({
      href: '/competition/bcc/register',
      label: 'See Your Team',
    })
  })
})
