import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '@/AppProviders'
import { createMockCartRepository } from '@/data/mock/mockCartRepository'
import { createMockShopRepository } from '@/data/mock/mockShopRepository'
import type { Services } from '@/data/repositories'

export function createTestServices(overrides: Partial<Services> = {}): Services {
  return {
    shop: createMockShopRepository({ latencyMs: 0 }),
    cart: createMockCartRepository(),
    forms: {
      subscribeNewsletter: vi.fn().mockResolvedValue(undefined),
      sendContactMessage: vi.fn().mockResolvedValue(undefined),
    },
    meta: { isDemo: true, accountUrl: null },
    ...overrides,
  }
}

interface RenderOptions {
  readonly route?: string
  readonly services?: Services
}

/** Rendert met router, React Query, services en winkelwagen, zoals in de echte app. */
export function renderWithProviders(ui: ReactElement, { route = '/', services = createTestServices() }: RenderOptions = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const result = render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders services={services} queryClient={queryClient}>
        {ui}
      </AppProviders>
    </MemoryRouter>,
  )
  return { ...result, services }
}
