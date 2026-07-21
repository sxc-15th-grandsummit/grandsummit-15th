import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('Merchandise page', () => {
  test('Buy Now links to the real Google Form, opened in a new tab', () => {
    expect(source).toContain('https://forms.gle/5SSfnYhLmB89oMsg9')
    expect(source).toContain('target="_blank"')
    expect(source).toContain('rel="noopener noreferrer"')
  })

  test('renders the requested bundle packages and add-on prices', () => {
    expect(source).toContain('Paket 1 (Wajib)')
    expect(source).toContain('140k')
    expect(source).toContain('Paket 2')
    expect(source).toContain('150k')
    expect(source).toContain('Paket 3')
    expect(source).toContain('160k')
    expect(source).toContain('Paket 4 (Lengkap)')
    expect(source).toContain('170k')
    expect(source).toContain('Sticker')
    expect(source).toContain('10k')
    expect(source).toContain('Keychain')
    expect(source).toContain('15k')
    expect(source).toContain('Enamel')
    expect(source).toContain('35k')
  })

  test('every bundle and add-on image path points at a real file in public/merch', () => {
    expect(source).toContain('/merch/T-Shirt.png')
    expect(source).toContain('/merch/Landyard.png')
    expect(source).toContain('/merch/Sticker.png')
    expect(source).toContain('/merch/Keychain.png')
    expect(source).toContain('/merch/Enamel.png')
  })

  test('uses a compact two-column collage for bundle photos', () => {
    expect(source).toContain('aspect-[4/5]')
    expect(source).toContain('grid-cols-2')
    expect(source).toContain('photos.length % 2 === 1')
    expect(source).not.toContain('rows?: number[]')
    expect(source).not.toContain('groupPhotosByRow')
  })

  test('does not implement a cart', () => {
    expect(source.toLowerCase()).not.toContain('add to cart')
    expect(source.toLowerCase()).not.toContain('add-to-cart')
  })
})
