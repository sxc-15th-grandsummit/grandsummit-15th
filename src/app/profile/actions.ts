'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type ProfileData = {
  full_name: string
  birth_date: string
  domicile: string
  whatsapp: string
  line_id: string
  current_education: string
  university: string
  student_card_url: string
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const payload: ProfileData = {
    full_name: formData.get('full_name') as string,
    birth_date: formData.get('birth_date') as string,
    domicile: formData.get('domicile') as string,
    whatsapp: formData.get('whatsapp') as string,
    line_id: formData.get('line_id') as string,
    current_education: formData.get('current_education') as string,
    university: formData.get('university') as string,
    student_card_url: (formData.get('student_card_url') as string) || '',
  }

  await supabase.from('profiles').upsert({ id: user.id, ...payload, updated_at: new Date().toISOString() })
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
