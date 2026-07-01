type AdminRegistryTeam = {
  competition: 'BCC' | 'MCC'
  is_semifinalist: boolean
}

type AdminRegistryFilters = {
  semifinalistsOnly: boolean
}

export function shouldShowTeamInAdminRegistry(
  team: AdminRegistryTeam,
  filters: AdminRegistryFilters,
) {
  if (!filters.semifinalistsOnly) return true

  return team.competition === 'BCC' && team.is_semifinalist
}
