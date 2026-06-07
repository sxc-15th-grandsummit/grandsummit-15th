export function canAccessRegisteredTeam({
  registrationOpen,
  paid,
  hasExistingTeam = false,
}: {
  registrationOpen: boolean
  paid: boolean
  hasExistingTeam?: boolean
}) {
  return registrationOpen || paid || hasExistingTeam
}

export function getRegistrationCta({
  registrationOpen,
  hasExistingTeam,
  href = '/competition/bcc/register',
  registerLabel = 'Register',
}: {
  registrationOpen: boolean
  hasExistingTeam: boolean
  href?: string
  registerLabel?: string
}) {
  if (hasExistingTeam) {
    return {
      href,
      label: 'See Your Team',
    }
  }

  if (registrationOpen) {
    return {
      href,
      label: registerLabel,
    }
  }

  return null
}
