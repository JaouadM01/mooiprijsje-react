import type { ReactNode } from 'react'

export type IconName =
  | 'alert'
  | 'arrow-right'
  | 'badge-check'
  | 'basket'
  | 'cart'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'facebook'
  | 'filter'
  | 'instagram'
  | 'mail'
  | 'phone'
  | 'refresh'
  | 'search'
  | 'shield'
  | 'tiktok'
  | 'trash'
  | 'user'

interface IconDefinition {
  /** Gevulde iconen (merklogo's) gebruiken fill in plaats van stroke. */
  readonly isFilled?: boolean
  readonly content: ReactNode
}

const ICONS: Readonly<Record<IconName, IconDefinition>> = {
  alert: {
    content: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
  },
  'arrow-right': { content: <path d="M5 12h14M13 6l6 6-6 6" /> },
  'badge-check': {
    content: (
      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
    ),
  },
  basket: {
    content: (
      <path d="M1 3h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6M16 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    ),
  },
  cart: {
    content: (
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  check: { content: <path d="M5 13l4 4L19 7" /> },
  'chevron-down': { content: <path d="M6 9l6 6 6-6" /> },
  'chevron-left': { content: <path d="M15 18l-6-6 6-6" /> },
  'chevron-right': { content: <path d="M9 18l6-6-6-6" /> },
  clock: {
    content: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </>
    ),
  },
  close: { content: <path d="M6 18L18 6M6 6l12 12" /> },
  facebook: {
    isFilled: true,
    content: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  filter: {
    content: (
      <>
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </>
    ),
  },
  instagram: {
    content: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  mail: {
    content: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
  },
  phone: {
    content: (
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    ),
  },
  refresh: {
    content: (
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
    ),
  },
  search: {
    content: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </>
    ),
  },
  shield: { content: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
  tiktok: {
    isFilled: true,
    content: (
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.19 8.19 0 0 0 4.79 1.52V7.02a4.85 4.85 0 0 1-1.02-.33z" />
    ),
  },
  trash: { content: <path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14M10 11v6M14 11v6" /> },
  user: {
    content: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
}

interface IconProps {
  readonly name: IconName
  readonly size?: number
  readonly strokeWidth?: number
  readonly className?: string
}

/** Decoratief icoon: verborgen voor schermlezers; geef de omringende knop of link een label. */
export function Icon({ name, size = 20, strokeWidth = 2, className }: IconProps) {
  const { isFilled = false, content } = ICONS[name]
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke={isFilled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {content}
    </svg>
  )
}

/** Neutrale plaatshouder voor producten zonder afbeelding. */
export function ImagePlaceholder({ className }: { readonly className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="Geen afbeelding beschikbaar"
    >
      <rect width="400" height="400" fill="#E2E8F0" />
      <rect x="140" y="60" width="120" height="280" rx="18" fill="#CBD5E1" />
      <rect x="150" y="80" width="100" height="230" rx="10" fill="#F1F5F9" />
      <circle cx="200" cy="325" r="7" fill="#94A3B8" />
    </svg>
  )
}
