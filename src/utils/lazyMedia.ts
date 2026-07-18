import { isBrokenMediaUrl, sanitizeBrokenMediaHtml } from './brokenMediaUrls'
import { ARTICLE_SIZES, GALLERY_SIZES } from './mediaUrls'

const LAZY_ROOT_MARGIN = '300px 0px'
const EAGER_GALLERY_IMAGES = 3

function parsePixelDimension(value: string | null | undefined): number | null {
  if (!value) return null
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)px$/)
  return match ? Math.round(Number(match[1])) : null
}

function applyLayoutDimensions(img: Element): void {
  const width = parsePixelDimension(img.getAttribute('data-width') || img.getAttribute('width'))
  const height = parsePixelDimension(img.getAttribute('data-height') || img.getAttribute('height'))
  if (width) img.setAttribute('width', String(width))
  if (height) img.setAttribute('height', String(height))
}

/** Only use srcset when variant URLs were stored at upload time (avoids 404s on old posts). */
function applyExplicitSrcSet(img: Element, inGallery: boolean): void {
  const full = img.getAttribute('src')
  const srcMd = img.getAttribute('data-src-md')
  const srcSm = img.getAttribute('data-src-sm')
  if (!full || !srcMd || !srcSm) return

  img.setAttribute('srcset', `${srcSm} 480w, ${srcMd} 960w, ${full} 1920w`)
  img.setAttribute('sizes', inGallery ? GALLERY_SIZES : ARTICLE_SIZES)
}

function createReaderVideo(doc: Document, src: string, poster?: string, title?: string): HTMLVideoElement {
  const video = doc.createElement('video')
  video.className = 'post-video-native'
  video.src = src
  video.controls = true
  video.playsInline = true
  video.preload = 'metadata'
  if (poster) video.poster = poster
  if (title) video.title = title
  return video
}

function hydrateVideoPlaceholder(
  doc: Document,
  container: HTMLElement,
  src: string,
  poster?: string,
  title?: string,
): void {
  container.innerHTML = ''
  container.classList.add('post-video-embed--ready', 'post-gallery__item--ready')
  container.appendChild(createReaderVideo(doc, src, poster, title))
}

export function prepareLazyMediaHtml(html: string): string {
  const doc = new DOMParser().parseFromString(sanitizeBrokenMediaHtml(html), 'text/html')
  let firstInlineImage = true
  let galleryImageIndex = 0

  doc.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:') || isBrokenMediaUrl(src)) return

    const inGallery = Boolean(img.closest('[data-type="gallery"]'))
    const eagerGallery = inGallery && galleryImageIndex < EAGER_GALLERY_IMAGES
    if (inGallery) galleryImageIndex += 1

    const eager = eagerGallery || (!inGallery && firstInlineImage)
    img.setAttribute('decoding', 'async')
    img.setAttribute('loading', eager ? 'eager' : 'lazy')
    if (eager && !inGallery && firstInlineImage) {
      img.setAttribute('fetchpriority', 'high')
    }

    applyLayoutDimensions(img)
    applyExplicitSrcSet(img, inGallery)

    if (!inGallery) firstInlineImage = false
  })

  // Legacy <video src> tags in saved HTML
  doc.querySelectorAll('video[src]').forEach((video) => {
    const src = video.getAttribute('src')
    if (!src || isBrokenMediaUrl(src)) return
    const poster = video.getAttribute('poster') || undefined
    const title = video.getAttribute('title') || undefined
    const figure = doc.createElement('figure')
    figure.setAttribute('data-type', 'video')
    figure.className = 'post-video-embed post-video-embed--ready'
    figure.appendChild(createReaderVideo(doc, src, poster, title))
    video.replaceWith(figure)
  })

  // Inline video blocks — render real <video> immediately (same as editor), not a JS skeleton
  doc.querySelectorAll('figure[data-type="video"][data-src]').forEach((figure) => {
    const src = figure.getAttribute('data-src')
    if (!src || isBrokenMediaUrl(src)) return
    const poster = figure.getAttribute('data-poster') || undefined
    const title = figure.getAttribute('data-title') || undefined
    hydrateVideoPlaceholder(doc, figure as HTMLElement, src, poster, title)
  })

  // Gallery videos — render immediately so they match editor preview
  doc.querySelectorAll('.post-gallery__item--video[data-src]').forEach((el) => {
    const src = el.getAttribute('data-src')
    if (!src || isBrokenMediaUrl(src)) return
    const poster = el.getAttribute('data-poster') || undefined
    const caption = el.getAttribute('data-caption') || undefined

    const mount = doc.createElement('div')
    mount.className = 'post-gallery__video-mount'
    mount.appendChild(createReaderVideo(doc, src, poster, caption))
    el.innerHTML = ''
    el.classList.add('post-gallery__item--ready')
    el.appendChild(mount)
  })

  return doc.body.innerHTML
}

/** Hydrate any videos that still need mounting (e.g. after client navigation). Images use native lazy loading. */
export function hydrateLazyMedia(container: HTMLElement): () => void {
  let cancelled = false

  const mountPendingVideos = () => {
    if (cancelled) return

    container.querySelectorAll<HTMLElement>('figure[data-type="video"][data-src]').forEach((figure) => {
      const src = figure.getAttribute('data-src')
      if (!src || isBrokenMediaUrl(src) || figure.querySelector('video')) return
      const poster = figure.getAttribute('data-poster') || undefined
      const title = figure.getAttribute('data-title') || undefined
      hydrateVideoPlaceholder(document, figure, src, poster, title)
    })

    container.querySelectorAll<HTMLElement>('.post-gallery__item--video[data-src]').forEach((el) => {
      const src = el.getAttribute('data-src')
      if (!src || isBrokenMediaUrl(src) || el.querySelector('video')) return
      const poster = el.getAttribute('data-poster') || undefined
      const caption = el.getAttribute('data-caption') || undefined

      const mount = document.createElement('div')
      mount.className = 'post-gallery__video-mount'
      mount.appendChild(createReaderVideo(document, src, poster, caption))
      el.innerHTML = ''
      el.classList.add('post-gallery__item--ready')
      el.appendChild(mount)
    })
  }

  mountPendingVideos()

  const observer = new IntersectionObserver(
    () => mountPendingVideos(),
    { rootMargin: LAZY_ROOT_MARGIN, threshold: 0.01 },
  )

  container.querySelectorAll<HTMLElement>('figure[data-type="video"][data-src], .post-gallery__item--video[data-src]').forEach((el) => {
    observer.observe(el)
  })

  return () => {
    cancelled = true
    observer.disconnect()
  }
}
