import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  readonly children: ReactNode
}

interface ErrorBoundaryState {
  readonly hasError: boolean
}

/** Vangnet: een onverwachte renderfout toont een nette melding in plaats van een wit scherm. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Enige plek met console-uitvoer: hier hoort later een foutmeldingsdienst (bijv. Sentry) te komen.
    console.error('Onverwachte fout in de weergave', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="page-width" style={{ padding: '64px 16px', textAlign: 'center' }} role="alert">
        <h1>Er ging iets mis</h1>
        <p>De pagina kon niet worden getoond. Probeer het opnieuw of ga terug naar de homepage.</p>
        {/* Bewust een gewone link: een volledige herlaadbeurt zet alle toestand terug. */}
        <a href="/" className="btn-primary">
          Naar de homepage
        </a>
      </div>
    )
  }
}
