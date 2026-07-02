import { useState } from 'react'
import type { TocHeading } from './TableOfContents'

interface MobileTableOfContentsProps {
  headings: TocHeading[]
}

export default function MobileTableOfContents({ headings }: MobileTableOfContentsProps) {
  const [open, setOpen] = useState(false)

  if (headings.length < 3) return null

  return (
    <div className="post-reader-toc-mobile lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="post-reader-toc-mobile__toggle"
      >
        On this page
        <span className="text-neutral-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <nav className="post-reader-toc-mobile__panel" aria-label="Table of contents">
          <ul className="space-y-0">
            {headings.map((h) => (
              <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 0.65}rem` }}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    setOpen(false)
                  }}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
