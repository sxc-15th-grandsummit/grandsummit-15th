import type { Metadata } from 'next'
import { createClient, getSessionUser } from '@/lib/supabase/server'
import BccContent from './bcc-content'

export const metadata: Metadata = {
  title: 'Business Case Competition',
  description:
    'SXC Grand Summit 15th Business Case Competition (BCC) — tackle real-world business cases and compete for prizes up to IDR 24.000.000++. Open to undergraduate students across Indonesia.',
  openGraph: {
    title: 'Business Case Competition | SXC Grand Summit 15th',
    description:
      'Tackle real-world business cases and compete for prizes up to IDR 24.000.000++. Open to undergraduate students across Indonesia.',
  },
}

async function getBccOpen() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'bcc_registration_open')
    .single()
  return data?.value === 'true'
}

async function getHasBccTeam() {
  const user = await getSessionUser()
  if (!user) return false

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('teams!inner(competition)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', 'BCC')
    .maybeSingle()

  if (error) {
    console.error('[bcc] failed to fetch team membership', error)
    return false
  }

  return Boolean(data)
}

export default async function BccPage() {
  const [bccOpen, hasTeam] = await Promise.all([
    getBccOpen(),
    getHasBccTeam(),
  ])

  return <BccContent bccOpen={bccOpen} hasTeam={hasTeam} />
}
