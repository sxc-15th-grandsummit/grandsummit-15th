import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { nama, nim, asal_universitas, major_program, instagram_username } = body

  if (!nama || !nim || !asal_universitas || !major_program || !instagram_username) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      nama: nama.trim(),
      nim: nim.trim(),
      asal_universitas: asal_universitas.trim(),
      major_program: major_program.trim(),
      instagram_username: instagram_username.trim(),
      is_complete: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
