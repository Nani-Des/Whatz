import type { PostReference } from '../types/post'
import { formatCitationLabel } from '../utils/citations'

interface PostReferencesProps {
  references: PostReference[]
}

export default function PostReferences({ references }: PostReferencesProps) {
  if (references.length === 0) return null

  return (
    <section id="references" className="mt-14 border-t border-neutral-200 pt-10 sm:mt-16 sm:pt-12">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
        References & resources
      </h2>
      <ol className="mt-5 list-none divide-y divide-neutral-100">
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
              className="group flex items-start gap-3 text-sm"
            >
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-600 transition-colors group-hover:bg-neutral-200"
                aria-hidden="true"
              >
                {formatCitationLabel(index + 1)}
              </span>
              <span className="min-w-0">
                <span className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition-colors group-hover:text-black group-hover:decoration-black">
                  {ref.title}
                </span>
                {ref.fileName && ref.fileName !== ref.title && (
                  <span className="mt-0.5 block text-xs text-neutral-400">{ref.fileName}</span>
                )}
                <span className="mt-0.5 block text-xs text-neutral-400">
                  {ref.type === 'upload' ? 'Uploaded file' : 'External link'}
                </span>
              </span>
              <span className="ml-auto shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600" aria-hidden="true">
                {ref.type === 'upload' ? '↓' : '↗'}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
