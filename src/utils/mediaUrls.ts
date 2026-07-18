import type { UploadedImageUrls } from '../types/media'

export type MediaVariant = 'full' | 'medium' | 'small'

const VARIANT_SUFFIX: Record<Exclude<MediaVariant, 'full'>, string> = {
  medium: '-md',
  small: '-sm',
}

/** Derive a variant URL from a full-size Firebase Storage image URL. */
export function mediaVariantUrl(url: string, variant: MediaVariant): string {
  if (!url || variant === 'full') return url
  const suffix = VARIANT_SUFFIX[variant]
  return url.replace(/(\.webp)(\?.*)?$/i, `${suffix}.webp$2`)
}

export function supportsImageVariants(url: string): boolean {
  return url.includes('firebasestorage') && /\.webp(\?|$)/i.test(url)
}

export function buildImageSrcSet(
  url: string,
  variantUrls?: Partial<Pick<UploadedImageUrls, 'medium' | 'small'>>,
): string | undefined {
  if (!supportsImageVariants(url)) return undefined
  const medium = variantUrls?.medium ?? mediaVariantUrl(url, 'medium')
  const small = variantUrls?.small ?? mediaVariantUrl(url, 'small')
  return `${small} 480w, ${medium} 960w, ${url} 1920w`
}

export const COVER_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 896px, 896px'
export const CARD_SIZES = '(max-width: 640px) 50vw, 400px'
export const ARTICLE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 720px'
export const GALLERY_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px'
