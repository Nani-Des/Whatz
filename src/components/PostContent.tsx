import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import 'highlight.js/styles/github-dark.css'
import type { PostReference } from '../types/post'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { prepareCitationsHtml } from '../utils/citations'
import { hydrateCodeBlocks, prepareCodeHtml } from '../utils/highlightCode'
import { hydrateLazyMedia, prepareLazyMediaHtml } from '../utils/lazyMedia'
import { hydrateMathElements, prepareMathHtml } from '../utils/katexRender'

interface PostContentProps {
  html: string
  references?: PostReference[]
  onHeadingsReady?: (container: HTMLElement) => void
  scrollReveal?: boolean
  staggerContent?: boolean
}

function handlePostLinkClick(e: Event, container: HTMLElement, navigate: (path: string) => void) {
  const link = (e.target as HTMLElement).closest('a.post-inline-link, a[data-type="post-link"]')
  if (!link || !container.contains(link)) return

  const href = link.getAttribute('href')
  if (!href?.startsWith('/post/')) return

  e.preventDefault()
  navigate(href)
}

function handleCitationClick(e: Event, container: HTMLElement) {
  const link = (e.target as HTMLElement).closest('a.citation-link, sup[data-type="citation"] a')
  if (!link || !container.contains(link)) return

  const refId = link.getAttribute('data-ref-id')
  if (!refId) return

  e.preventDefault()
  const target = document.getElementById(`ref-${refId}`)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('citation-highlight')
    window.setTimeout(() => target.classList.remove('citation-highlight'), 1600)
  }
}

export default function PostContent({
  html,
  references = [],
  onHeadingsReady,
  scrollReveal = false,
  staggerContent = false,
}: PostContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const lazyHtml = useMemo(
    () =>
      prepareLazyMediaHtml(
        prepareCodeHtml(prepareMathHtml(prepareCitationsHtml(html, references))),
      ),
    [html, references],
  )

  useScrollReveal(ref, scrollReveal, staggerContent, [lazyHtml])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    hydrateCodeBlocks(el)
    hydrateMathElements(el)
    onHeadingsReady?.(el)

    const onClick = (e: Event) => {
      handleCitationClick(e, el)
      handlePostLinkClick(e, el, navigate)
    }
    el.addEventListener('click', onClick)

    const cleanupMedia = hydrateLazyMedia(el)

    return () => {
      el.removeEventListener('click', onClick)
      cleanupMedia()
    }
  }, [lazyHtml, references, onHeadingsReady, navigate])

  return (
    <div
      ref={ref}
      className="post-content post-content--article"
      dangerouslySetInnerHTML={{ __html: lazyHtml }}
    />
  )
}
