import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('MCC public page registration CTA', () => {
  test('uses the shared team-aware CTA helper', () => {
    expect(source).toContain("import { getRegistrationCta } from '@/lib/registration-access'")
    expect(source).toContain('getRegistrationCta({')
    expect(source).toContain("href: '/competition/mcc/register'")
    expect(source).toContain('hasExistingTeam: hasTeam')
  })
})
