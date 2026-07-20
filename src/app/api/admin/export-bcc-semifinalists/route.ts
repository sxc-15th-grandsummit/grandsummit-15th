import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { syncBccSemifinalistsToSheets } from '@/lib/sync-sheets'
import { NextResponse } from 'next/server'

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { rows } = await syncBccSemifinalistsToSheets()
  return NextResponse.json({ ok: true, rows })
}
