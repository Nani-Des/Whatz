import { useState } from 'react'
import {
  ARTICLE_SIZES,
  buildImageSrcSet,
  CARD_SIZES,
  COVER_SIZES,
  GALLERY_SIZES,
  mediaVariantUrl,
  supportsImageVariants,
} from '../utils/mediaUrls'

interface ResponsiveImageProps {
  src: string
  alt?: string
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  fetchPriority?: 'high' | 'low' | 'auto'
  sizes?: string
  preferredSize?: 'full' | 'medium' | 'small'
  srcMd?: string
  srcSm?: string
}

export default function ResponsiveImage({
  src,
  alt = '',
  className,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  sizes,
  preferredSize = 'full',
  srcMd,
  srcSm,
}: ResponsiveImageProps) {
  const initialSrc = preferredSize === 'full' ? src : mediaVariantUrl(src, preferredSize)
  const [currentSrc, setCurrentSrc] = useState(initialSrc)

  const srcSet = srcMd || srcSm
    ? buildImageSrcSet(src, { medium: srcMd ?? mediaVariantUrl(src, 'medium'), small: srcSm ?? mediaVariantUrl(src, 'small') })
    : supportsImageVariants(src)
      ? buildImageSrcSet(src)
      : undefined

  return (
    <img
      src={currentSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      onError={() => {
        if (currentSrc !== src) setCurrentSrc(src)
      }}
    />
  )
}

export { CARD_SIZES, COVER_SIZES, ARTICLE_SIZES, GALLERY_SIZES }
