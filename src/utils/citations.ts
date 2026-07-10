import type { PostReference } from '../types/post'

export function getCitationIndex(references: PostReference[], refId: string): number {
  const idx = references.findIndex((r) => r.id === refId)
  return idx >= 0 ? idx + 1 : 0
}

export function formatCitationLabel(index: number): string {
  return `[${index}]`
}

export function findReference(references: PostReference[], refId: string): PostReference | undefined {
  return references.find((r) => r.id === refId)
}

const CITATION_LINK_SELECTOR = 'sup[data-type="citation"] a, a.citation-link[data-ref-id]'

/** Set citation labels and bibliography anchor hrefs (survives React re-renders). */
export function prepareCitationsHtml(html: string, references: PostReference[]): string {
  if (!references.length || !html.includes('citation')) return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll<HTMLElement>(CITATION_LINK_SELECTOR).forEach((link) => {
    const refId = link.getAttribute('data-ref-id')
    if (!refId) return

    const index = getCitationIndex(references, refId)
    if (index <= 0) {
      link.textContent = '[?]'
      link.removeAttribute('href')
      return
    }

    link.textContent = formatCitationLabel(index)
    link.setAttribute('href', `#ref-${refId}`)
    link.removeAttribute('target')
    link.removeAttribute('rel')
  })

  return doc.body.innerHTML
}

export function createCitationNumberResolver(references: PostReference[]) {
  return (refId: string): number | null => {
    const index = getCitationIndex(references, refId)
    return index > 0 ? index : null
  }
}
