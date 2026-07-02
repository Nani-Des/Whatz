import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import VideoPlayer from '../components/VideoPlayer'

export function prepareLazyMediaHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:')) return
    img.setAttribute('data-lazy-src', src)
    img.removeAttribute('src')
    img.classList.add('post-lazy-image')
    img.setAttribute('decoding', 'async')
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

function scheduleIdle(callback: () => void) {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback, { timeout: 1800 })
  } else {
    window.setTimeout(callback, 120)
  }
}

export function hydrateLazyMedia(container: HTMLElement): () => void {
  const roots: Root[] = []
  let cancelled = false

  const load = () => {
    if (cancelled) return

    container.querySelectorAll<HTMLImageElement>('img[data-lazy-src]').forEach((img) => {
      const src = img.getAttribute('data-lazy-src')
      if (!src) return
      img.src = src
      img.removeAttribute('data-lazy-src')
      img.classList.remove('post-lazy-image')
      img.classList.add('post-lazy-image--loaded')
    })

    container.querySelectorAll<HTMLElement>('figure[data-type="video"][data-src]').forEach((figure) => {
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
    })
  }

  requestAnimationFrame(() => scheduleIdle(load))

  return () => {
    cancelled = true
    roots.forEach((root) => root.unmount())
  }
}
