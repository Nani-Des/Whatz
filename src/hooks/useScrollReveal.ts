import { useEffect } from 'react'
import type { PostAnimationSettings } from '../types/postAnimation'

const REVEAL_SELECTOR =
  'p, h1, h2, h3, h4, blockquote, pre, ul, ol, img, table, hr, .callout, .collapsible-block, .citation, .post-video-embed, .post-gallery, .text-sticker'

export function useScrollReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  stagger: boolean,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const blocks = container.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    blocks.forEach((el, index) => {
      el.classList.add('post-reveal')
      if (stagger) {
        el.style.setProperty('--reveal-delay', `${Math.min(index * 55, 600)}ms`)
      } else {
        el.style.removeProperty('--reveal-delay')
      }
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('post-reveal--visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    blocks.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [containerRef, enabled, stagger, ...deps])
}

export function useRevealElement(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      el.classList.add('post-reveal--visible')
      return
    }

    el.classList.add('post-reveal')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add('post-reveal--visible')
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -5% 0px', threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, enabled, ...deps])
}

export function animationClass(settings: PostAnimationSettings): string {
  return `post-anim--${settings.preset}`
}
