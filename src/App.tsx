import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AboutPage } from '@/pages/AboutPage'
import { CollectionPage } from '@/pages/CollectionPage'
import { ContactPage } from '@/pages/ContactPage'
import { HomePage } from '@/pages/HomePage'
import { InfoPage } from '@/pages/InfoPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProductPage } from '@/pages/ProductPage'
import { SearchPage } from '@/pages/SearchPage'

/** Zelfde URL-structuur als het Shopify-theme, zodat bestaande links en SEO blijven werken. */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="collections" element={<Navigate to="/collections/all" replace />} />
        <Route path="collections/:handle" element={<CollectionPage />} />
        <Route path="products/:handle" element={<ProductPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="pages/contact" element={<ContactPage />} />
        <Route path="pages/over-ons" element={<AboutPage />} />
        <Route path="pages/veelgestelde-vragen" element={<InfoPage page="faq" />} />
        <Route path="pages/verzending" element={<InfoPage page="shipping" />} />
        <Route path="pages/retourbeleid" element={<InfoPage page="returns" />} />
        <Route path="policies/:handle" element={<InfoPage page="policy" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
