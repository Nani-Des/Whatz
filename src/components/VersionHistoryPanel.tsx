import { useEffect, useState } from 'react'
import { getPostVersions } from '../services/versions'
import type { PostVersion } from '../types/post'
import { formatDate } from '../utils/formatDate'

interface VersionHistoryPanelProps {
  postId: string | null
  onRestore: (version: PostVersion) => void
}

export default function VersionHistoryPanel({ postId, onRestore }: VersionHistoryPanelProps) {
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
          {loading && <p className="text-xs text-neutral-500">Loading versions…</p>}
          {!loading && versions.length === 0 && (
            <p className="text-xs text-neutral-500">No saved versions yet. Versions are created on each save.</p>
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
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
