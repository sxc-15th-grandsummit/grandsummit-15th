export const BCC_BASE_PRICE = 135000
export const BCC_PROMO_PRICE = 110000
export const BCC_EXTENDED_PRICE = 165000
export const BCC_EXTENDED_PROMO_PRICE = 140000

export const MCC_EARLY_BIRD_PRICE = 40000
export const MCC_NORMAL_PRICE = 65000
export const MCC_EXTENDED_PRICE = 90000

const BCC_EXTENDED_START = Date.UTC(2026, 4, 20, 17, 0, 0) // 21 May 2026 00:00 GMT+7
const BCC_EXTENDED_END = Date.UTC(2026, 4, 26, 16, 59, 59, 999) // 26 May 2026 23:59 GMT+7

const MCC_EARLY_BIRD_END = Date.UTC(2026, 5, 5, 16, 59, 59, 999) // 5 June 2026 23:59:59 WIB
const MCC_EXTENDED_START = Date.UTC(2026, 5, 17, 17, 0, 0) // 18 June 2026 00:00 GMT+7
const MCC_EXTENDED_END = Date.UTC(2026, 5, 30, 16, 59, 59, 999) // 30 June 2026 23:59 WIB

export function isBccExtendedRegistration(now = new Date()) {
  const time = now.getTime()
  return time >= BCC_EXTENDED_START && time <= BCC_EXTENDED_END
}

export function isMccExtendedRegistration(now = new Date()) {
  const time = now.getTime()
  return time >= MCC_EXTENDED_START && time <= MCC_EXTENDED_END
}

export function getBccRegistrationFee(hasReferralCode: boolean, now = new Date()) {
  if (isBccExtendedRegistration(now)) return hasReferralCode ? BCC_EXTENDED_PROMO_PRICE : BCC_EXTENDED_PRICE
  return hasReferralCode ? BCC_PROMO_PRICE : BCC_BASE_PRICE
}

export function getMccRegistrationFee(now = new Date()) {
  const time = now.getTime()
  if (time <= MCC_EARLY_BIRD_END) return MCC_EARLY_BIRD_PRICE
  if (time >= MCC_EXTENDED_START && time <= MCC_EXTENDED_END) return MCC_EXTENDED_PRICE
  return MCC_NORMAL_PRICE
}

export function getBccEffectiveRegistrationFee({
  hasReferralCode,
  paid,
  paymentUploadedAt,
  storedRegistrationFee,
  now = new Date(),
}: {
  hasReferralCode: boolean
  paid: boolean
  paymentUploadedAt?: Date | string | null
  storedRegistrationFee: number | null
  now?: Date
}) {
  if (!paid) return getBccRegistrationFee(hasReferralCode, now)
  if (!paymentUploadedAt) return storedRegistrationFee

  const paidAt = paymentUploadedAt instanceof Date
    ? paymentUploadedAt
    : new Date(paymentUploadedAt)

  if (Number.isNaN(paidAt.getTime())) return storedRegistrationFee
  return getBccRegistrationFee(hasReferralCode, paidAt)
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
