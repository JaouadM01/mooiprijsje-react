import { escapeHtml, sanitizeHtml } from './sanitize'

describe('sanitizeHtml', () => {
  it('keeps safe markup', () => {
    expect(sanitizeHtml('<p>Hallo <strong>wereld</strong></p><ul><li>een</li></ul>')).toBe(
      '<p>Hallo <strong>wereld</strong></p><ul><li>een</li></ul>',
    )
  })

  it('removes script tags', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>')
  })

  it('removes inline event handlers', () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">')
    expect(result).not.toContain('onerror')
  })

  it('removes javascript: urls', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">klik</a>')
    expect(result).not.toContain('javascript:')
  })
})

describe('sanitizeHtml hardening', () => {
  it('removes forms and inputs (phishing on our own domain)', () => {
    const result = sanitizeHtml('<p>Hoi</p><form action="https://evil.example"><input type="password"><button>Ga</button></form>')
    expect(result).not.toMatch(/<form|<input|<button|evil\.example/)
    expect(result).toContain('Hoi')
  })

  it('removes inline styles (full-screen overlays)', () => {
    expect(sanitizeHtml('<div style="position:fixed;inset:0">x</div>')).not.toContain('style')
  })

  it('removes iframes and style blocks', () => {
    expect(sanitizeHtml('<iframe src="https://evil.example"></iframe><style>body{display:none}</style>ok')).toBe('ok')
  })

  it('keeps http(s), mailto, tel and relative links', () => {
    const html = '<a href="https://a.nl">a</a><a href="mailto:x@y.nl">b</a><a href="tel:0612345678">c</a><a href="/pages/contact">d</a>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('removes other schemes such as data: and vbscript: from links', () => {
    const result = sanitizeHtml('<a href="data:text/html,<b>x</b>">a</a><a href="vbscript:x">b</a>')
    expect(result).not.toMatch(/data:|vbscript:/)
  })

  it('keeps tables and images from https', () => {
    const html = '<table><tbody><tr><th>Naam</th><td>Waarde</td></tr></tbody></table><img src="https://cdn.shopify.com/a.jpg" alt="x">'
    expect(sanitizeHtml(html)).toBe(html)
  })
})

describe('escapeHtml', () => {
  it('escapes markup characters', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;',
    )
  })
})
