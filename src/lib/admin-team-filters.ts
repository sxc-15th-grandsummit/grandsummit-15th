type AdminRegistryTeam = {
  competition: 'BCC' | 'MCC'
  is_semifinalist: boolean
  is_finalist: boolean
}

type AdminRegistryFilters = {
  semifinalistsOnly: boolean
  finalistsOnly: boolean
}

export function shouldShowTeamInAdminRegistry(
  team: AdminRegistryTeam,
  filters: AdminRegistryFilters,
) {
  if (filters.semifinalistsOnly && (team.competition !== 'BCC' || !team.is_semifinalist)) return false
  if (filters.finalistsOnly && (team.competition !== 'BCC' || !team.is_finalist)) return false
  return true
}
