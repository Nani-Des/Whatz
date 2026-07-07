import { useEffect, useState } from 'react'
import { getPostVersions } from '../services/versions'
import type { PostVersion } from '../types/post'
import { formatDate } from '../utils/formatDate'

interface VersionHistoryPanelProps {
  postId: string | null
  currentSavedAt: Date | null
  onRestore: (version: PostVersion) => void
  onReloadCurrent: () => void
}

export default function VersionHistoryPanel({
  postId,
  currentSavedAt,
  onRestore,
  onReloadCurrent,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<PostVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!postId || !open) return
    setLoading(true)
    getPostVersions(postId)
      .then(setVersions)
      .finally(() => setLoading(false))
  }, [postId, open])

  if (!postId) return null

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-900"
      >
        Version history
        <span className="text-neutral-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-neutral-100 px-4 py-3">
          <div className="mb-4 rounded-lg border border-neutral-900 bg-neutral-900 px-3 py-2.5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-300">Current saved version</p>
            <p className="mt-1 text-xs text-neutral-100">
              The live post document is always your source of truth — not the snapshots below.
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-300">
                {currentSavedAt ? `Last saved ${formatDate(currentSavedAt)}` : 'Saved to Firestore'}
              </span>
              <button
                type="button"
                onClick={onReloadCurrent}
                className="shrink-0 rounded bg-white px-2.5 py-1 text-[10px] font-semibold text-neutral-900 hover:bg-neutral-100"
              >
                Reload current
              </button>
            </div>
          </div>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Past snapshots</p>
          {loading && <p className="text-xs text-neutral-500">Loading snapshots…</p>}
          {!loading && versions.length === 0 && (
            <p className="text-xs text-neutral-500">No snapshots yet. One is saved when you click Save or leave the editor.</p>
          )}
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-neutral-600">{formatDate(v.createdAt)} — {v.title || 'Untitled'}</span>
                <button
                  type="button"
                  onClick={() => onRestore(v)}
                  className="shrink-0 font-medium text-neutral-800 hover:underline"
                >
                  Restore snapshot
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
