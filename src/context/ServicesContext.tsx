import { createContext, useContext, type ReactNode } from 'react'
import type { Services } from '@/data/repositories'

const ServicesContext = createContext<Services | null>(null)

interface ServicesProviderProps {
  readonly services: Services
  readonly children: ReactNode
}

export function ServicesProvider({ services, children }: ServicesProviderProps) {
  return <ServicesContext value={services}>{children}</ServicesContext>
}

export function useServices(): Services {
  const services = useContext(ServicesContext)
  if (services === null) throw new Error('useServices moet binnen een ServicesProvider worden gebruikt.')
  return services
}
