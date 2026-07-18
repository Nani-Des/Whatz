import { isBrokenMediaUrl, sanitizeBrokenMediaHtml } from './brokenMediaUrls'
import { ARTICLE_SIZES, buildImageSrcSet, GALLERY_SIZES } from './mediaUrls'

const LAZY_ROOT_MARGIN = '400px 0px'
const LAZY_THRESHOLD = 0.01
const EAGER_GALLERY_IMAGES = 3

function parsePixelDimension(value: string | null | undefined): number | null {
  if (!value) return null
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)px$/)
  return match ? Math.round(Number(match[1])) : null
}

function applyResponsiveAttrs(
  img: Element,
  sizes: string,
  eager = false,
): void {
  const full = img.getAttribute('data-lazy-src') || img.getAttribute('src')
  if (!full || isBrokenMediaUrl(full)) return

  const srcMd = img.getAttribute('data-src-md') || undefined
  const srcSm = img.getAttribute('data-src-sm') || undefined
  const srcSet = buildImageSrcSet(full, { medium: srcMd, small: srcSm })

  if (srcSet) {
    img.setAttribute('srcset', srcSet)
    img.setAttribute('sizes', sizes)
  }

  if (eager) {
    img.setAttribute('data-fetch-priority', 'high')
    img.setAttribute('loading', 'eager')
  } else {
    img.setAttribute('loading', 'lazy')
  }
}

function applyLayoutDimensions(img: Element): void {
  const width = parsePixelDimension(img.getAttribute('data-width') || img.getAttribute('width'))
  const height = parsePixelDimension(img.getAttribute('data-height') || img.getAttribute('height'))
  if (width) img.setAttribute('width', String(width))
  if (height) img.setAttribute('height', String(height))
}

function mountNativeVideo(
  container: HTMLElement,
  src: string,
  poster?: string,
  title?: string,
): void {
  container.innerHTML = ''
  container.classList.add('post-video-embed--ready')

  const video = document.createElement('video')
  video.className = 'post-video-native'
  video.src = src
  video.controls = true
  video.playsInline = true
  video.preload = 'none'
  if (poster) video.poster = poster
  if (title) video.title = title
  container.appendChild(video)
}

function mountGalleryVideo(el: HTMLElement): void {
  if (el.querySelector('video')) return
  const src = el.getAttribute('data-src')
  if (!src || isBrokenMediaUrl(src)) return

  const poster = el.getAttribute('data-poster') || undefined
  const caption = el.getAttribute('data-caption') || undefined
  el.innerHTML = ''
  el.classList.add('post-gallery__item--ready')

  const mount = document.createElement('div')
  mount.className = 'post-gallery__video-mount'
  el.appendChild(mount)
  mountNativeVideo(mount, src, poster, caption)
}

function mountInlineVideo(figure: HTMLElement): void {
  if (figure.querySelector('video')) return

  const src = figure.getAttribute('data-src')
  if (!src || isBrokenMediaUrl(src)) return

  const poster = figure.getAttribute('data-poster') || undefined
  const title = figure.getAttribute('data-title') || undefined
  mountNativeVideo(figure, src, poster, title)
}

function loadLazyImage(img: HTMLImageElement): void {
  const src = img.getAttribute('data-lazy-src')
  if (!src || isBrokenMediaUrl(src)) {
    img.removeAttribute('data-lazy-src')
    return
  }

  const priority = img.getAttribute('data-fetch-priority')
  if (priority === 'high') {
    img.fetchPriority = 'high'
    img.loading = 'eager'
  }

  img.src = src
  img.removeAttribute('data-lazy-src')
  img.classList.remove('post-lazy-image')
  img.classList.add('post-lazy-image--loaded')
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

    if (!eagerGallery) {
      img.setAttribute('data-lazy-src', src)
      img.removeAttribute('src')
      img.classList.add('post-lazy-image')
    }

    img.setAttribute('decoding', 'async')
    applyLayoutDimensions(img)
    applyResponsiveAttrs(img, inGallery ? GALLERY_SIZES : ARTICLE_SIZES, eagerGallery)

    if (!inGallery && firstInlineImage) {
      img.setAttribute('data-fetch-priority', 'high')
      if (!eagerGallery) img.setAttribute('loading', 'lazy')
      firstInlineImage = false
    }
  })

  doc.querySelectorAll('video[src]').forEach((video) => {
    const src = video.getAttribute('src')
    if (!src || isBrokenMediaUrl(src)) return
    const figure = doc.createElement('figure')
    figure.setAttribute('data-type', 'video')
    figure.setAttribute('data-src', src)
    figure.className = 'post-video-embed'
    const poster = video.getAttribute('poster')
    if (poster) figure.setAttribute('data-poster', poster)
    figure.innerHTML = '<div class="post-video-skeleton" aria-hidden="true">Video</div>'
    video.replaceWith(figure)
  })

  return doc.body.innerHTML
}

export function hydrateLazyMedia(container: HTMLElement): () => void {
  let cancelled = false

  const observer = new IntersectionObserver(
    (entries) => {
      if (cancelled) return

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const target = entry.target

        if (target instanceof HTMLImageElement && target.hasAttribute('data-lazy-src')) {
          loadLazyImage(target)
          observer.unobserve(target)
          return
        }

        if (!(target instanceof HTMLElement)) return

        if (target.matches('figure[data-type="video"][data-src]')) {
          mountInlineVideo(target)
          observer.unobserve(target)
          return
        }

        if (target.matches('.post-gallery__item--video[data-src]')) {
          mountGalleryVideo(target)
          observer.unobserve(target)
        }
      })
    },
    { rootMargin: LAZY_ROOT_MARGIN, threshold: LAZY_THRESHOLD },
  )

  container.querySelectorAll<HTMLImageElement>('img[data-lazy-src]').forEach((img) => {
    observer.observe(img)
  })

  container.querySelectorAll<HTMLElement>('figure[data-type="video"][data-src]').forEach((figure) => {
    observer.observe(figure)
  })

  container.querySelectorAll<HTMLElement>('.post-gallery__item--video[data-src]').forEach((el) => {
    observer.observe(el)
  })

  return () => {
    cancelled = true
    observer.disconnect()
  }
}
