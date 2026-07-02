import { useRef } from 'react'
import type { PostReference } from '../types/post'
import { useRevealElement } from '../hooks/useScrollReveal'
import { formatCitationLabel } from '../utils/citations'

interface PostReferencesProps {
  references: PostReference[]
  reveal?: boolean
}

export default function PostReferences({ references, reveal = false }: PostReferencesProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealElement(sectionRef, reveal, [references.length])

  if (references.length === 0) return null

  return (
    <section ref={sectionRef} id="references" className="post-reader-references">
      <h2 className="post-reader-references__title">References & resources</h2>
      <ol className="mt-4 list-none divide-y divide-neutral-100">
        {references.map((ref, index) => (
          <li
            key={ref.id}
            id={`ref-${ref.id}`}
            className="scroll-mt-24 py-3 first:pt-0 transition-colors duration-300"
          >
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 text-sm no-underline"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-100 font-mono text-[10px] font-semibold text-neutral-600 transition-colors group-hover:bg-neutral-200"
                aria-hidden="true"
              >
                {formatCitationLabel(index + 1)}
              </span>
              <span className="min-w-0">
                <span className="font-medium text-neutral-900 underline decoration-neutral-200 underline-offset-2 transition-colors group-hover:text-black group-hover:decoration-neutral-400">
                  {ref.title}
                </span>
                {ref.fileName && ref.fileName !== ref.title && (
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-neutral-400">{ref.fileName}</span>
                )}
              </span>
              <span className="ml-auto shrink-0 text-xs text-neutral-400 transition-colors group-hover:text-neutral-600" aria-hidden="true">
                {ref.type === 'upload' ? '↓' : '↗'}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
