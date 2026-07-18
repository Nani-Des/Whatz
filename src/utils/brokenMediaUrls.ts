const BARE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Temporary browser URLs or other non-persistent src values saved by mistake. */
export function isBrokenMediaUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true
  const trimmed = url.trim()
  if (trimmed.startsWith('blob:')) return true
  if (BARE_UUID.test(trimmed)) return true
  return false
}

export function contentHasBrokenMediaUrls(html: string): boolean {
  if (!html) return false
  if (html.includes('blob:')) return true
  return /(?:src|data-src|data-poster)=["'][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}["']/i.test(
    html,
  )
}

function markBrokenImage(img: Element, doc: Document, label = 'Image unavailable'): void {
  img.removeAttribute('src')
  img.removeAttribute('data-lazy-src')
  img.classList.add('post-media--broken')
  img.setAttribute('alt', label)
  img.setAttribute('role', 'img')
  if (!img.textContent?.trim()) {
    const note = doc.createElement('span')
    note.className = 'post-media-unavailable'
    note.textContent = label
    img.appendChild(note)
  }
}

function markBrokenMediaEl(el: Element, doc: Document, label: string): void {
  el.removeAttribute('data-src')
  el.removeAttribute('data-poster')
  el.classList.add('post-media--broken')
  if (el.querySelector('.post-media-unavailable')) return
  const note = doc.createElement('div')
  note.className = 'post-media-unavailable'
  note.textContent = label
  el.appendChild(note)
}

/** Strip broken blob/UUID media from saved HTML so the reader never requests them. */
export function sanitizeBrokenMediaHtml(html: string): string {
  if (!contentHasBrokenMediaUrls(html)) return html

  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('img[src], img[data-lazy-src]').forEach((img) => {
    const src = img.getAttribute('src') || img.getAttribute('data-lazy-src')
    if (isBrokenMediaUrl(src)) markBrokenImage(img, doc)
  })

  doc.querySelectorAll('[data-src], [data-poster]').forEach((el) => {
    const src = el.getAttribute('data-src')
    const poster = el.getAttribute('data-poster')
    if (isBrokenMediaUrl(src) || isBrokenMediaUrl(poster)) {
      markBrokenMediaEl(el, doc, 'Media unavailable — re-upload in the editor')
    }
  })

  doc.querySelectorAll('figure[data-type="gallery"][data-items]').forEach((figure) => {
    const raw = figure.getAttribute('data-items')
    if (!raw) return
    try {
      const items = JSON.parse(raw) as Array<{ src?: string; poster?: string }>
      if (!Array.isArray(items)) return
      const cleaned = items.filter(
        (item) => !isBrokenMediaUrl(item?.src) && !isBrokenMediaUrl(item?.poster),
      )
      if (cleaned.length > 0) {
        figure.setAttribute('data-items', JSON.stringify(cleaned))
      } else {
        figure.removeAttribute('data-items')
      }
    } catch {
      figure.removeAttribute('data-items')
    }
  })

  return doc.body.innerHTML
}
