import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

const routes = ['upload', 'upload-session', 'complete', 'submit'] as const

describe('BCC final submission API access', () => {
  for (const route of routes) {
    test(`${route} rejects non-finalist teams`, () => {
      const source = readFileSync(new URL(`./${route}/route.ts`, import.meta.url), 'utf8')

      expect(source).toContain('canAccessBccFinalSubmission')
      expect(source).toContain('is_finalist')
      expect(source).toContain('Only BCC finalists can access final submission')
    })
  }
})
