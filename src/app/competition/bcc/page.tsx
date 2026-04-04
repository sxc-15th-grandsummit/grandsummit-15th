import { createClient } from '@/lib/supabase/server'
import BccContent from './bcc-content'

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
