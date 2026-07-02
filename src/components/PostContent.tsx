import { useEffect, useMemo, useRef } from 'react'
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
import { formatCitationLabel, getCitationIndex } from '../utils/citations'
import { hydrateLazyMedia, prepareLazyMediaHtml } from '../utils/lazyMedia'

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

function hydrateCitations(container: HTMLElement, references: PostReference[]) {
  const links = container.querySelectorAll<HTMLElement>('sup[data-type="citation"] a, a.citation-link[data-ref-id]')
  links.forEach((link) => {
    const refId = link.getAttribute('data-ref-id')
    if (!refId) return

    const index = getCitationIndex(references, refId)
    if (index > 0) {
      link.textContent = formatCitationLabel(index)
      link.setAttribute('href', `#ref-${refId}`)
    } else {
      link.textContent = '[?]'
      link.removeAttribute('href')
    }
  })
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
    setTimeout(() => target.classList.remove('citation-highlight'), 1600)
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
  const lazyHtml = useMemo(() => prepareLazyMediaHtml(html), [html])

  useScrollReveal(ref, scrollReveal, staggerContent, [lazyHtml])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })

    hydrateCitations(el, references)
    onHeadingsReady?.(el)

    const onClick = (e: Event) => handleCitationClick(e, el)
    el.addEventListener('click', onClick)

    const cleanupMedia = hydrateLazyMedia(el)

    return () => {
      el.removeEventListener('click', onClick)
      cleanupMedia()
    }
  }, [lazyHtml, references, onHeadingsReady])

  return (
    <div
      ref={ref}
      className="post-content post-content--article"
      dangerouslySetInnerHTML={{ __html: lazyHtml }}
    />
  )
}
