// De globale CSS moet vóór de component-CSS geladen worden, anders winnen de basisregels bij gelijke specificiteit.
import './styles/tokens.css'
import './styles/base.css'
import './components/common/common.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { AppProviders } from './AppProviders'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { createServices } from './data/createServices'
import { ConfigError, readAppConfig } from './lib/env'

const rootElement = document.getElementById('root')
if (rootElement === null) throw new Error('Element #root ontbreekt in index.html.')
const root = createRoot(rootElement)

function ConfigErrorScreen({ message }: { readonly message: string }) {
  return (
    <div className="page-width" style={{ padding: '64px 16px' }} role="alert">
      <h1>Configuratiefout</h1>
      <p>{message}</p>
      <p>Controleer je .env-bestand (zie .env.example) en herstart de ontwikkelserver.</p>
    </div>
  )
}

try {
  const services = createServices(readAppConfig())
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AppProviders services={services}>
            <App />
          </AppProviders>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (error) {
  if (!(error instanceof ConfigError)) throw error
  root.render(<ConfigErrorScreen message={error.message} />)
}
