import { useEffect, useState } from 'react'

export interface TocHeading {
  id: string
  text: string
  level: number
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'section'
}

export function extractHeadings(html: string): TocHeading[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3')
  const used = new Set<string>()

  return Array.from(headings).map((el) => {
    const text = el.textContent?.trim() || 'Section'
    let id = slugifyHeading(text)
    let suffix = 2
    while (used.has(id)) {
      id = `${slugifyHeading(text)}-${suffix++}`
    }
    used.add(id)
    return { id, text, level: parseInt(el.tagName[1], 10) }
  })
}

export function injectHeadingIds(container: HTMLElement, headings: TocHeading[]) {
  const els = container.querySelectorAll('h1, h2, h3')
  els.forEach((el, i) => {
    if (headings[i]) el.id = headings[i].id
  })
}

interface TableOfContentsProps {
  headings: TocHeading[]
  className?: string
  variant?: 'light' | 'dark'
}

export default function TableOfContents({ headings, className = '', variant = 'dark' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState('')
  const isLight = variant === 'light'

  useEffect(() => {
    if (headings.length < 3) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 3) return null

  return (
    <nav className={`toc ${className}`} aria-label="Table of contents">
      <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
        On this page
      </p>
      <ul className="space-y-1 text-sm">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 0.65}rem` }}>
            <a
              href={`#${h.id}`}
              className={`block border-l-2 py-1 pl-3 transition-colors ${
                activeId === h.id
                  ? isLight
                    ? 'border-black font-medium text-black'
                    : 'border-white text-white'
                  : isLight
                    ? 'border-transparent text-neutral-500 hover:text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
