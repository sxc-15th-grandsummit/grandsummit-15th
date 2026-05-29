export function canAccessRegisteredTeam({
  registrationOpen,
  paid,
}: {
  registrationOpen: boolean
  paid: boolean
}) {
  return registrationOpen || paid
}
