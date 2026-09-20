import type { ShopImage } from '@/types/shop'
import { escapeHtml } from '@/lib/sanitize'

export type MockCategory = 'schermen' | 'laadpoorten' | 'accessoires' | 'onderdelen'

interface CategoryTheme {
  readonly emoji: string
  readonly from: string
  readonly to: string
}

const CATEGORY_THEMES: Readonly<Record<MockCategory, CategoryTheme>> = {
  schermen: { emoji: '📱', from: '#EFF6FF', to: '#BFDBFE' },
  laadpoorten: { emoji: '🔌', from: '#ECFDF5', to: '#A7F3D0' },
  accessoires: { emoji: '🎧', from: '#F5F3FF', to: '#DDD6FE' },
  onderdelen: { emoji: '🔧', from: '#FFFBEB', to: '#FDE68A' },
}

/** Per beeldvariant een andere compositie, zodat de productgalerij iets te wisselen heeft. */
const VARIANT_LAYOUTS = [
  { rotate: 0, scale: 1, x: 400, y: 440 },
  { rotate: -14, scale: 0.9, x: 380, y: 450 },
  { rotate: 12, scale: 1.15, x: 420, y: 430 },
] as const

/** Maakt een herkenbare placeholder-afbeelding (data-URI) zonder externe bestanden. */
export function mockImage(category: MockCategory, title: string, variant: 0 | 1 | 2): ShopImage {
  const theme = CATEGORY_THEMES[category]
  const layout = VARIANT_LAYOUTS[variant]
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">`,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="${theme.from}"/><stop offset="1" stop-color="${theme.to}"/>`,
    `</linearGradient></defs>`,
    `<rect width="800" height="800" fill="url(#g)"/>`,
    `<circle cx="640" cy="160" r="120" fill="#fff" fill-opacity=".35"/>`,
    `<text x="${layout.x}" y="${layout.y}" font-size="${Math.round(300 * layout.scale)}" text-anchor="middle"`,
    ` transform="rotate(${layout.rotate} ${layout.x} ${layout.y})">${theme.emoji}</text>`,
    `</svg>`,
  ].join('')

  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    altText: `${escapeHtml(title)} — afbeelding ${variant + 1}`,
  }
}
