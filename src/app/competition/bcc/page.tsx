import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
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

export default async function BccPage() {
  const bccOpen = await getBccOpen()
  return <BccContent bccOpen={bccOpen} />
}
