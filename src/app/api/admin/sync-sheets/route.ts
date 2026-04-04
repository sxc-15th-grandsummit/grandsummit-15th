import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { syncTeamsToSheets } from '@/lib/sync-sheets'
import { NextResponse } from 'next/server'

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  await syncTeamsToSheets()
  return NextResponse.json({ ok: true })
}
