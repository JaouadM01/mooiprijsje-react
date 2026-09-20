import { Outlet } from 'react-router-dom'
import { useServices } from '@/context/ServicesContext'
import { ScrollToTop } from '../common/ScrollToTop'
import './layout.css'
import { AnnouncementBar } from './AnnouncementBar'
import { CartDrawer } from './CartDrawer'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  const { meta } = useServices()

  return (
    <>
      <a className="skip-to-content sr-only sr-only-focusable" href="#MainContent">
        Ga naar hoofdinhoud
      </a>

      {meta.isDemo && (
        <div className="demo-banner" role="note">
          Demo-modus: dit zijn voorbeeldproducten. Koppel je Shopify-winkel via het .env-bestand.
        </div>
      )}
      <AnnouncementBar />
      <Header />

      <main id="MainContent" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
      <CartDrawer />
      <ScrollToTop />
    </>
  )
}
