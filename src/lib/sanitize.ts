import DOMPurify from 'dompurify'

/**
 * HTML uit Shopify (beschrijvingen, metafields) komt van beheerders, leveranciers en apps en is dus niet
 * volledig te vertrouwen. Naast scripts en on*-handlers weren we alles waarmee een nep-inlogformulier of
 * een scherm-overlay op onze eigen domeinnaam gebouwd kan worden.
 */
const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['form', 'input', 'button', 'select', 'textarea', 'option', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base'],
  FORBID_ATTR: ['style', 'action', 'formaction'],
  // Alleen http(s), mailto en tel; relatieve links blijven toegestaan.
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
}

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, SANITIZE_CONFIG)
}

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}
