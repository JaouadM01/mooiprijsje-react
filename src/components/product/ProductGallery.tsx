import { useState } from 'react'
import type { ShopImage } from '@/types/shop'
import { ImagePlaceholder } from '../common/Icon'
import './product.css'

const MAX_THUMBNAILS = 5

interface ProductGalleryProps {
  readonly images: readonly ShopImage[]
  readonly title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const current = images[selectedIndex] ?? images[0]
  const thumbnails = images.slice(0, MAX_THUMBNAILS)

  return (
    <div className="product__gallery">
      <div className="product__main-image-wrapper">
        {current ? (
          <img
            className="product__main-image"
            src={current.url}
            alt={current.altText ?? title}
            width={900}
            height={900}
            fetchPriority="high"
          />
        ) : (
          <ImagePlaceholder className="product__main-image" />
        )}
      </div>

      {thumbnails.length > 1 && (
        <ul className="product__thumbnails" aria-label="Productafbeeldingen">
          {thumbnails.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                className={index === selectedIndex ? 'product__thumbnail product__thumbnail--active' : 'product__thumbnail'}
                aria-label={`Afbeelding ${index + 1} bekijken`}
                aria-pressed={index === selectedIndex}
                onClick={() => setSelectedIndex(index)}
              >
                <img src={image.url} alt="" width={120} height={120} loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
