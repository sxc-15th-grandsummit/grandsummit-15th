import 'server-only'

export function normalizeBccReferralCode(code: unknown) {
  return typeof code === 'string' ? code.trim().toUpperCase() : ''
}
