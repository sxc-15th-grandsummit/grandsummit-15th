type ProfileCompletenessFields = {
  is_complete?: boolean | null
  nama?: string | null
  nim?: string | null
  asal_universitas?: string | null
  major_program?: string | null
  instagram_username?: string | null
  line_id?: string | null
  wa_no?: string | null
}

function hasText(value: string | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isProfileComplete(profile: ProfileCompletenessFields | null | undefined) {
  if (!profile) return false

  return Boolean(
    hasText(profile.nama) &&
    hasText(profile.nim) &&
    hasText(profile.asal_universitas) &&
    hasText(profile.major_program) &&
    hasText(profile.instagram_username) &&
    hasText(profile.line_id) &&
    hasText(profile.wa_no)
  )
}
