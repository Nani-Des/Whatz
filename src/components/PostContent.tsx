import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'
import type { PostReference } from '../types/post'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { prepareCitationsHtml } from '../utils/citations'
import { hydrateLazyMedia, prepareLazyMediaHtml } from '../utils/lazyMedia'
import { hydrateMathElements, prepareMathHtml } from '../utils/katexRender'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('plaintext', () => ({ name: 'Plain text', contains: [] }))
hljs.registerLanguage('text', () => ({ name: 'Plain text', contains: [] }))

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
    () => prepareLazyMediaHtml(prepareMathHtml(prepareCitationsHtml(html, references))),
    [html, references],
  )

  useScrollReveal(ref, scrollReveal, staggerContent, [lazyHtml])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })

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
