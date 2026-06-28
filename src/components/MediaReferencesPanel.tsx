import { useRef, useState } from 'react'
import type { PostReference } from '../types/post'
import { uploadPostMedia } from '../services/storage'
import { formatCitationLabel, getCitationIndex } from '../utils/citations'

interface MediaReferencesPanelProps {
  references: PostReference[]
  onChange: (refs: PostReference[]) => void
  postId: string | null
  onEnsurePostId: () => Promise<string>
}

function citeReference(refId: string) {
  window.dispatchEvent(new CustomEvent('editor:insert-citation', { detail: { refId } }))
}

export default function MediaReferencesPanel({
  references,
  onChange,
  postId,
  onEnsurePostId,
}: MediaReferencesPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const addReference = (ref: PostReference) => {
    onChange([...references, ref])
  }

  const removeReference = (id: string) => {
    onChange(references.filter((r) => r.id !== id))
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError('')
    try {
      let id = postId
      if (!id) id = await onEnsurePostId()
      for (const file of Array.from(files)) {
        const { url, fileName, mimeType } = await uploadPostMedia(id, file)
        addReference({
          id: crypto.randomUUID(),
          type: 'upload',
          title: fileName,
          url,
          fileName,
          mimeType,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return
    addReference({
      id: crypto.randomUUID(),
      type: 'link',
      title: linkTitle.trim(),
      url: linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`,
    })
    setLinkTitle('')
    setLinkUrl('')
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-900">References & media</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Upload files or add links, then cite them inline with <span className="font-medium">Cite</span> or the toolbar dropdown.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload files'}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <input
          type="text"
          value={linkTitle}
          onChange={(e) => setLinkTitle(e.target.value)}
          placeholder="Reference title"
          className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-neutral-400 focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddLink}
            className="shrink-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Add link
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {references.length > 0 && (
        <ul className="mt-4 space-y-2">
          {references.map((ref) => {
            const index = getCitationIndex(references, ref.id)
            return (
              <li key={ref.id} className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2">
                <span className="shrink-0 text-xs font-semibold text-neutral-500">
                  {formatCitationLabel(index)}
                </span>
                <span className="text-xs text-neutral-400">{ref.type === 'upload' ? '📎' : '🔗'}</span>
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm text-neutral-800 hover:underline">
                  {ref.title}
                </a>
                <button
                  type="button"
                  onClick={() => citeReference(ref.id)}
                  className="shrink-0 text-xs font-medium text-neutral-700 hover:text-black"
                >
                  Cite
                </button>
                <button type="button" onClick={() => removeReference(ref.id)} className="shrink-0 text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
