import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Newsletter } from '@/components/home/Newsletter'
import { Testimonials } from '@/components/home/Testimonials'
import { UspBar } from '@/components/home/UspBar'
import { HOME_HEADING, NEW_ARRIVALS, SPOTLIGHT } from '@/config/home'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function HomePage() {
  useDocumentTitle(null)

  return (
    <>
      <h1 className="sr-only">{HOME_HEADING}</h1>
      <FeaturedProducts rail={SPOTLIGHT} isSpotlight />
      <UspBar />
      <CategoryGrid />
      <FeaturedProducts rail={NEW_ARRIVALS} />
      <Testimonials />
      <Newsletter />
    </>
  )
}
