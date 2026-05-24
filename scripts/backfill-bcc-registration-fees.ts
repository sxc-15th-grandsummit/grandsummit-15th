import { existsSync, readFileSync } from 'fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getDriveFileCreatedTime } from '../src/lib/google/drive'
import { getBccEffectiveRegistrationFee } from '../src/lib/referral-codes'

type TeamRecord = {
  id: string
  name: string | null
  referral_code: string | null
  registration_fee: number | null
  payment_uploaded_at: string | null
  bukti_pembayaran_drive_id: string | null
}

function loadEnvFile(path: string) {
  if (!existsSync(path)) return

  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

async function fetchBccTeams(supabase: SupabaseClient) {
  const teams: TeamRecord[] = []
  const pageSize = 500

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, referral_code, registration_fee, payment_uploaded_at, bukti_pembayaran_drive_id')
      .eq('competition', 'BCC')
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) throw error
    teams.push(...((data ?? []) as TeamRecord[]))
    if (!data || data.length < pageSize) break
  }

  return teams
}

async function main() {
  loadEnvFile('.env.local')

  const apply = process.argv.includes('--apply')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error: columnError } = await supabase
    .from('teams')
    .select('payment_uploaded_at')
    .limit(1)

  if (columnError) {
    console.error('Missing payment_uploaded_at column or table access failed.')
    console.error('Run this SQL once in Supabase SQL Editor:')
    console.error('  alter table teams add column if not exists payment_uploaded_at timestamptz;')
    throw columnError
  }

  const teams = await fetchBccTeams(supabase)
  let changed = 0
  let skippedPaidWithoutTimestamp = 0

  for (const team of teams) {
    const paid = hasValue(team.bukti_pembayaran_drive_id)
    let paymentUploadedAt = team.payment_uploaded_at

    if (paid && !paymentUploadedAt && team.bukti_pembayaran_drive_id) {
      paymentUploadedAt = await getDriveFileCreatedTime(team.bukti_pembayaran_drive_id).catch((err) => {
        console.error(`[backfill] Failed to read Drive createdTime for ${team.id} (${team.name ?? '-'})`, err)
        return null
      })
    }

    const registrationFee = getBccEffectiveRegistrationFee({
      hasReferralCode: hasValue(team.referral_code),
      paid,
      paymentUploadedAt,
      storedRegistrationFee: team.registration_fee,
    })

    if (paid && !paymentUploadedAt && registrationFee === null) {
      skippedPaidWithoutTimestamp += 1
      console.log(`[skip] ${team.id} ${team.name ?? '-'}: paid but no upload timestamp and no stored fee`)
      continue
    }

    const updates: Pick<TeamRecord, 'registration_fee' | 'payment_uploaded_at'> = {
      registration_fee: registrationFee,
      payment_uploaded_at: paid ? paymentUploadedAt : null,
    }

    const feeChanged = team.registration_fee !== updates.registration_fee
    const timeChanged = (team.payment_uploaded_at ?? null) !== (updates.payment_uploaded_at ?? null)
    if (!feeChanged && !timeChanged) continue

    changed += 1
    console.log(
      `[${apply ? 'update' : 'dry-run'}] ${team.id} ${team.name ?? '-'}: ` +
      `fee ${team.registration_fee ?? 'NULL'} -> ${updates.registration_fee ?? 'NULL'}, ` +
      `payment_uploaded_at ${team.payment_uploaded_at ?? 'NULL'} -> ${updates.payment_uploaded_at ?? 'NULL'}`
    )

    if (apply) {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', team.id)

      if (error) throw error
    }
  }

  console.log(`Scanned ${teams.length} BCC teams.`)
  console.log(`${apply ? 'Updated' : 'Would update'} ${changed} teams.`)
  if (skippedPaidWithoutTimestamp > 0) {
    console.log(`Skipped ${skippedPaidWithoutTimestamp} paid teams without upload timestamp or stored fee.`)
  }
  if (!apply) console.log('Run with --apply to write these changes to Supabase.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
