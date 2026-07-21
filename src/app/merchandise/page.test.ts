import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('Merchandise page', () => {
  test('Buy Now and View Bundles link to the real Google Form, opened in a new tab', () => {
    expect(source).toContain('https://forms.gle/5SSfnYhLmB89oMsg9')
    expect(source).toContain('target="_blank"')
    expect(source).toContain('rel="noopener noreferrer"')
  })

  test('does not implement a cart', () => {
    expect(source.toLowerCase()).not.toContain('add to cart')
    expect(source.toLowerCase()).not.toContain('add-to-cart')
  })
})
