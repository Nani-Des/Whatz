import { useEffect, useRef } from 'react'
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
import { formatCitationLabel, getCitationIndex } from '../utils/citations'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)

interface PostContentProps {
  html: string
  references?: PostReference[]
  onHeadingsReady?: (container: HTMLElement) => void
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

export default function PostContent({ html, references = [], onHeadingsReady }: PostContentProps) {
  const ref = useRef<HTMLDivElement>(null)

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
    return () => el.removeEventListener('click', onClick)
  }, [html, references, onHeadingsReady])

  return (
    <div
      ref={ref}
      className="post-content prose prose-neutral max-w-none
        prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-black
        prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl
        prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
        prose-p:text-neutral-700 prose-p:text-[1.0625rem] prose-p:leading-[1.75]
        prose-a:text-black prose-a:font-medium prose-a:underline prose-a:underline-offset-2 prose-a:decoration-neutral-300 hover:prose-a:decoration-black
        prose-blockquote:border-l-neutral-300 prose-blockquote:text-neutral-600 prose-blockquote:font-normal
        prose-code:rounded-md prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:text-neutral-800 prose-code:before:content-none prose-code:after:content-none
        prose-pre:rounded-xl prose-pre:bg-neutral-900 prose-pre:shadow-sm prose-pre:ring-1 prose-pre:ring-neutral-200
        prose-img:rounded-xl prose-img:shadow-md prose-img:ring-1 prose-img:ring-neutral-200/80
        prose-table:text-sm prose-th:bg-neutral-50 prose-th:text-neutral-800
        prose-td:border-neutral-200 prose-th:border-neutral-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
