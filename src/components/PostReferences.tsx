import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { PostReference } from '../types/post'
import { useRevealElement } from '../hooks/useScrollReveal'
import { formatCitationLabel } from '../utils/citations'
import { isPostReference, referenceHref } from '../utils/postLinks'

interface PostReferencesProps {
  references: PostReference[]
  reveal?: boolean
}

export default function PostReferences({ references, reveal = false }: PostReferencesProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealElement(sectionRef, reveal, [references.length])

  if (references.length === 0) return null

  const hasPostRefs = references.some(isPostReference)
  const sectionTitle = hasPostRefs && references.every(isPostReference)
    ? 'Referenced posts'
    : 'References & resources'

  return (
    <section ref={sectionRef} id="references" className="post-reader-references">
      <h2 className="post-reader-references__title">{sectionTitle}</h2>
      <ol className="mt-4 list-none divide-y divide-neutral-100">
        {references.map((ref, index) => {
          const href = referenceHref(ref)
          const inner = (
            <>
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
                {ref.type === 'post' && (
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-neutral-400">Portfolio post</span>
                )}
                {ref.fileName && ref.fileName !== ref.title && (
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-neutral-400">{ref.fileName}</span>
                )}
              </span>
              <span className="ml-auto shrink-0 text-xs text-neutral-400 transition-colors group-hover:text-neutral-600" aria-hidden="true">
                {ref.type === 'upload' ? '↓' : ref.type === 'post' ? '→' : '↗'}
              </span>
            </>
          )

          return (
            <li
              key={ref.id}
              id={`ref-${ref.id}`}
              className="scroll-mt-24 py-3 first:pt-0 transition-colors duration-300"
            >
              {isPostReference(ref) ? (
                <Link to={href} className="group flex items-start gap-3 text-sm no-underline">
                  {inner}
                </Link>
              ) : (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 text-sm no-underline"
                >
                  {inner}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
