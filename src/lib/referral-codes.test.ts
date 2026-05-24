import { describe, expect, test } from 'bun:test'
import {
  BCC_BASE_PRICE,
  BCC_EXTENDED_PRICE,
  BCC_EXTENDED_PROMO_PRICE,
  BCC_PROMO_PRICE,
  getBccEffectiveRegistrationFee,
} from './referral-codes'

describe('getBccEffectiveRegistrationFee', () => {
  const duringExtended = new Date('2026-05-24T12:00:00+07:00')
  const beforeExtended = new Date('2026-05-20T19:00:00+07:00')
  const extendedStart = new Date('2026-05-21T00:00:00+07:00')

  test('charges current extended price for unpaid teams without referral', () => {
    expect(getBccEffectiveRegistrationFee({
      hasReferralCode: false,
      paid: false,
      storedRegistrationFee: BCC_BASE_PRICE,
      now: duringExtended,
    })).toBe(BCC_EXTENDED_PRICE)
  })

  test('charges current extended promo price for unpaid teams with referral', () => {
    expect(getBccEffectiveRegistrationFee({
      hasReferralCode: true,
      paid: false,
      storedRegistrationFee: BCC_PROMO_PRICE,
      now: duringExtended,
    })).toBe(BCC_EXTENDED_PROMO_PRICE)
  })

  test('charges normal price when proof of payment was uploaded before extended registration', () => {
    expect(getBccEffectiveRegistrationFee({
      hasReferralCode: false,
      paid: true,
      paymentUploadedAt: beforeExtended,
      storedRegistrationFee: BCC_EXTENDED_PRICE,
      now: duringExtended,
    })).toBe(BCC_BASE_PRICE)
  })

  test('charges normal promo price when referral proof of payment was uploaded before extended registration', () => {
    expect(getBccEffectiveRegistrationFee({
      hasReferralCode: true,
      paid: true,
      paymentUploadedAt: beforeExtended,
      storedRegistrationFee: BCC_EXTENDED_PROMO_PRICE,
      now: duringExtended,
    })).toBe(BCC_PROMO_PRICE)
  })

  test('charges extended price when proof of payment was uploaded at extended registration start', () => {
    expect(getBccEffectiveRegistrationFee({
      hasReferralCode: false,
      paid: true,
      paymentUploadedAt: extendedStart,
      storedRegistrationFee: BCC_BASE_PRICE,
      now: duringExtended,
    })).toBe(BCC_EXTENDED_PRICE)
  })

  test('falls back to stored price for paid teams when upload time is unavailable', () => {
    expect(getBccEffectiveRegistrationFee({
      hasReferralCode: false,
      paid: true,
      storedRegistrationFee: BCC_BASE_PRICE,
      now: duringExtended,
    })).toBe(BCC_BASE_PRICE)
  })
})
