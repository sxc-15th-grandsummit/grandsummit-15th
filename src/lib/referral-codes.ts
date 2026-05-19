export const BCC_BASE_PRICE = 135000
export const BCC_PROMO_PRICE = 110000
export const BCC_EXTENDED_PRICE = 165000

const BCC_EXTENDED_START = Date.UTC(2026, 4, 20, 17, 0, 0) // 21 May 2026 00:00 GMT+7
const BCC_EXTENDED_END = Date.UTC(2026, 4, 25, 16, 59, 59, 999) // 25 May 2026 23:59 GMT+7

export function isBccExtendedRegistration(now = new Date()) {
  const time = now.getTime()
  return time >= BCC_EXTENDED_START && time <= BCC_EXTENDED_END
}

export function getBccRegistrationFee(hasReferralCode: boolean, now = new Date()) {
  if (isBccExtendedRegistration(now)) return BCC_EXTENDED_PRICE
  return hasReferralCode ? BCC_PROMO_PRICE : BCC_BASE_PRICE
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
