import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import MccContent from './mcc-content'

export const metadata: Metadata = {
  title: 'Mini Case Competition',
  description:
    'SXC Grand Summit 15th Mini Case Competition (MCC) - a fast-paced business challenge for high school and undergraduate students across Indonesia.',
  openGraph: {
    title: 'Mini Case Competition | SXC Grand Summit 15th',
    description:
      'Showcase your analytical thinking and creativity through one powerful pitch deck in MCC StudentsxCEOs 15th Grand Summit.',
  },
}

async function getMccOpen() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'mcc_registration_open')
    .single()
  return data?.value === 'true'
}

export default async function MccPage() {
  const mccOpen = await getMccOpen()
  return <MccContent mccOpen={mccOpen} />
}
