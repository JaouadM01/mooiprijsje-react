import { useMemo } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'

interface RichTextProps {
  readonly html: string
  readonly className?: string
}

/** Toont HTML uit Shopify (beschrijvingen, metafields), altijd eerst gesaneerd. */
export function RichText({ html, className }: RichTextProps) {
  const safeHtml = useMemo(() => sanitizeHtml(html), [html])
  return <div className={className ? `rte ${className}` : 'rte'} dangerouslySetInnerHTML={{ __html: safeHtml }} />
}
