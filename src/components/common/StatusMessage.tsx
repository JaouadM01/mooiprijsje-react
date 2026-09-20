import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function LoadingState({ label = 'Laden…' }: { readonly label?: string }) {
  return (
    <div className="status" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface ErrorStateProps {
  readonly message: string
  readonly onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="status status--error" role="alert">
      <Icon name="alert" size={32} />
      <p className="status__message">{message}</p>
      {onRetry && (
        <button type="button" className="btn-outline" onClick={onRetry}>
          Opnieuw proberen
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  readonly title: string
  readonly children?: ReactNode
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="status status--empty">
      <Icon name="search" size={64} strokeWidth={1} />
      <h2 className="status__title">{title}</h2>
      {children}
    </div>
  )
}
