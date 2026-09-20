import { countActiveFilters, isAllowedFilter, parseCollectionParams, updateParams } from './collectionParams'

const parse = (search: string) => parseCollectionParams('schermen', new URLSearchParams(search))

describe('parseCollectionParams', () => {
  it('returns sensible defaults for an empty query string', () => {
    expect(parse('')).toEqual({
      handle: 'schermen',
      sort: 'manual',
      filters: [],
      priceMin: null,
      priceMax: null,
      after: null,
      before: null,
      pageSize: 24,
    })
  })

  it('falls back to manual sort for unknown values', () => {
    expect(parse('sort=hack').sort).toBe('manual')
    expect(parse('sort=price-descending').sort).toBe('price-descending')
  })

  it('accepts comma decimals and ignores negative or invalid prices', () => {
    expect(parse('price_min=10,5&price_max=abc').priceMin).toBe(10.5)
    expect(parse('price_min=10,5&price_max=abc').priceMax).toBeNull()
    expect(parse('price_min=-3').priceMin).toBeNull()
  })

  it('parses prices strictly, rounds to cents and caps absurd values', () => {
    expect(parse('price_min=12abc').priceMin).toBeNull()
    expect(parse('price_min=10.456').priceMin).toBe(10.46)
    expect(parse('price_max=1e308').priceMax).toBe(100000)
  })

  it('swaps reversed price bounds', () => {
    const query = parse('price_min=50&price_max=10')
    expect([query.priceMin, query.priceMax]).toEqual([10, 50])
  })

  it('prefers the after cursor over before', () => {
    const query = parse('after=abc&before=def')
    expect([query.after, query.before]).toEqual(['abc', null])
    expect(parse('before=def').before).toBe('def')
  })

  it('keeps only allowed filters', () => {
    const good = '{"productVendor":"Apple"}'
    const query = parse(`f=${encodeURIComponent(good)}&f=${encodeURIComponent('{"evil":1}')}&f=not-json`)
    expect(query.filters).toEqual([good])
  })

  it('caps the number of filters', () => {
    const many = Array.from({ length: 30 }, (_, i) => `f=${encodeURIComponent(`{"tag":"t${i}"}`)}`).join('&')
    expect(parse(many).filters).toHaveLength(20)
  })
})

describe('isAllowedFilter', () => {
  it.each([
    ['{"available":true}', true],
    ['{"productType":"Schermen"}', true],
    ['{"variantOption":{"name":"Kleur","value":"Zwart"}}', true],
    ['{"available":"yes"}', false],
    ['{"available":true,"extra":1}', false],
    ['[]', false],
    ['', false],
  ])('%s -> %s', (raw, expected) => {
    expect(isAllowedFilter(raw)).toBe(expected)
  })

  it('rejects oversized values', () => {
    expect(isAllowedFilter(`{"tag":"${'a'.repeat(400)}"}`)).toBe(false)
  })
})

describe('updateParams', () => {
  it('sets, replaces and removes keys without touching the input', () => {
    const current = new URLSearchParams('sort=price-ascending&price_min=5')
    const next = updateParams(current, { sort: 'title-ascending', price_min: null })
    expect(next.toString()).toBe('sort=title-ascending')
    expect(current.toString()).toBe('sort=price-ascending&price_min=5')
  })

  it('resets paging when something else changes', () => {
    const next = updateParams(new URLSearchParams('after=12&sort=manual'), { sort: 'price-ascending' })
    expect(next.has('after')).toBe(false)
  })

  it('keeps paging when the change is a paging change', () => {
    const next = updateParams(new URLSearchParams('sort=manual'), { after: '11' })
    expect(next.get('after')).toBe('11')
    expect(next.get('sort')).toBe('manual')
  })

  it('writes repeated parameters for arrays', () => {
    const next = updateParams(new URLSearchParams('f=old'), { f: ['a', 'b'] })
    expect(next.getAll('f')).toEqual(['a', 'b'])
  })

  it('drops empty string values', () => {
    expect(updateParams(new URLSearchParams('price_max=9'), { price_max: '' }).has('price_max')).toBe(false)
  })
})

describe('countActiveFilters', () => {
  it('counts list filters and the price range once', () => {
    expect(countActiveFilters({ filters: ['a', 'b'], priceMin: 5, priceMax: 10 })).toBe(3)
    expect(countActiveFilters({ filters: [], priceMin: null, priceMax: null })).toBe(0)
  })
})
