import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { CartProvider } from '@/context/CartContext'
import { ServicesProvider } from '@/context/ServicesContext'
import type { Services } from '@/data/repositories'

const ONE_MINUTE_MS = 60_000

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: ONE_MINUTE_MS, retry: 1, refetchOnWindowFocus: false },
    },
  })
}

interface AppProvidersProps {
  readonly services: Services
  readonly queryClient?: QueryClient
  readonly children: ReactNode
}

/** Alle app-brede providers behalve de router, zodat tests een MemoryRouter kunnen gebruiken. */
export function AppProviders({ services, queryClient, children }: AppProvidersProps) {
  const [defaultClient] = useState(createQueryClient)
  return (
    <QueryClientProvider client={queryClient ?? defaultClient}>
      <ServicesProvider services={services}>
        <CartProvider>{children}</CartProvider>
      </ServicesProvider>
    </QueryClientProvider>
  )
}
