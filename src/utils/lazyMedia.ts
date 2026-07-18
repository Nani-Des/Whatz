import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import VideoPlayer from '../components/VideoPlayer'

const LAZY_ROOT_MARGIN = '320px 0px'
const LAZY_THRESHOLD = 0.01

function mountGalleryVideo(el: HTMLElement, roots: Root[]): void {
  if (el.querySelector('.post-video-player')) return
  const src = el.getAttribute('data-src')
  if (!src) return

  const poster = el.getAttribute('data-poster') || undefined
  const caption = el.getAttribute('data-caption') || undefined
  el.innerHTML = ''
  el.classList.add('post-gallery__item--ready')

  const mount = document.createElement('div')
  mount.className = 'post-gallery__video-mount'
  el.appendChild(mount)

  const root = createRoot(mount)
  root.render(createElement(VideoPlayer, { src, poster, title: caption }))
  roots.push(root)
}

function mountInlineVideo(figure: HTMLElement, roots: Root[]): void {
  if (figure.querySelector('.post-video-player')) return

  const src = figure.getAttribute('data-src')
  if (!src) return

  const poster = figure.getAttribute('data-poster') || undefined
  const title = figure.getAttribute('data-title') || undefined
  figure.innerHTML = ''
  figure.classList.add('post-video-embed--ready')

  const root = createRoot(figure)
  root.render(createElement(VideoPlayer, { src, poster, title }))
  roots.push(root)
}

function loadLazyImage(img: HTMLImageElement): void {
  const src = img.getAttribute('data-lazy-src')
  if (!src) return

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
  const doc = new DOMParser().parseFromString(html, 'text/html')
  let firstInlineImage = true

  doc.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:')) return

    img.setAttribute('data-lazy-src', src)
    img.removeAttribute('src')
    img.classList.add('post-lazy-image')
    img.setAttribute('decoding', 'async')
    img.setAttribute('loading', 'lazy')

    if (firstInlineImage && !img.closest('[data-type="gallery"]')) {
      img.setAttribute('data-fetch-priority', 'high')
      firstInlineImage = false
    }
  })

  doc.querySelectorAll('video[src]').forEach((video) => {
    const src = video.getAttribute('src')
    if (!src) return
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
  const roots: Root[] = []
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
          mountInlineVideo(target, roots)
          observer.unobserve(target)
          return
        }

        if (target.matches('.post-gallery__item--video[data-src]')) {
          mountGalleryVideo(target, roots)
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
    roots.forEach((root) => root.unmount())
  }
}
