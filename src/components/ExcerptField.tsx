import { getExcerpt } from '../utils/excerpt'

interface ExcerptFieldProps {
  value: string
  content: string
  manual: boolean
  onChange: (value: string) => void
  onAutoFill: () => void
  onClear: () => void
}

const MAX_LENGTH = 320

export default function ExcerptField({
  value,
  content,
  manual,
  onChange,
  onAutoFill,
  onClear,
}: ExcerptFieldProps) {
  const autoPreview = getExcerpt(content, 160)
  const usingAuto = !manual && !value.trim()
  const usingNone = manual && !value.trim()

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <label className="text-sm font-semibold text-neutral-900">Excerpt</label>
          <p className="mt-0.5 text-xs text-neutral-500">Used on cards and SEO. Leave empty to auto-generate, or clear for no excerpt.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAutoFill}
            className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Auto-fill
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
        placeholder={usingAuto ? autoPreview || 'Write a short summary…' : 'Write a short summary…'}
        rows={3}
        className="mt-3 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200/80"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <span>
          {usingAuto ? (
            <>Will auto-generate from content on save</>
          ) : usingNone ? (
            <>No excerpt — cards will use a content preview</>
          ) : (
            <>Custom excerpt — saved as written</>
          )}
        </span>
        <span>{value.length}/{MAX_LENGTH}</span>
      </div>
    </div>
  )
}
