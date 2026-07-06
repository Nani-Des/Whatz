import { useEffect, useMemo, useState } from 'react'
import type { Post, PostReference } from '../types/post'
import { getAllPosts } from '../services/posts'
import { buildPostReference } from '../utils/postLinks'

export type PostPickMode = 'reference' | 'inline'

interface PostReferencesPanelProps {
  currentPostId: string | null
  references: PostReference[]
  onChange: (refs: PostReference[]) => void
  onInsertInline?: (post: Pick<Post, 'id' | 'title' | 'slug'>) => void
}

function citeReference(refId: string) {
  window.dispatchEvent(new CustomEvent('editor:insert-citation', { detail: { refId } }))
}

export default function PostReferencesPanel({
  currentPostId,
  references,
  onChange,
  onInsertInline,
}: PostReferencesPanelProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [highlightId, setHighlightId] = useState<string | null>(null)

  useEffect(() => {
    getAllPosts()
      .then(setPosts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load posts.'))
      .finally(() => setLoading(false))
  }, [])

  const postRefs = useMemo(
    () => references.filter((ref) => ref.type === 'post'),
    [references],
  )

  const referencedPostIds = useMemo(
    () => new Set(postRefs.map((ref) => ref.postId).filter(Boolean)),
    [postRefs],
  )

  const availablePosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts
      .filter((post) => post.id !== currentPostId)
      .filter((post) => {
        if (!q) return true
        return (
          post.title.toLowerCase().includes(q)
          || post.slug.toLowerCase().includes(q)
          || post.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      })
      .slice(0, 12)
  }, [posts, currentPostId, query])

  const addPostReference = (post: Post) => {
    if (referencedPostIds.has(post.id)) return
    onChange([...references, buildPostReference(post)])
    setHighlightId(post.id)
    window.setTimeout(() => setHighlightId(null), 1200)
  }

  const removePostReference = (refId: string) => {
    onChange(references.filter((ref) => ref.id !== refId))
  }

  const handlePick = (post: Post, mode: PostPickMode) => {
    if (mode === 'reference') addPostReference(post)
    else onInsertInline?.({ id: post.id, title: post.title, slug: post.slug })
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-900">Refer other posts</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Link to articles or projects from your portfolio — add to the references list or insert an inline link.
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts…"
        className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-neutral-400 focus:outline-none"
      />

      {loading && <p className="mt-3 text-xs text-neutral-400">Loading posts…</p>}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {!loading && !error && availablePosts.length === 0 && (
        <p className="mt-3 text-xs text-neutral-400">No matching posts.</p>
      )}

      {availablePosts.length > 0 && (
        <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto">
          {availablePosts.map((post) => (
            <li
              key={post.id}
              className={`rounded-lg border px-3 py-2 transition-colors ${
                highlightId === post.id
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-100 bg-neutral-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`truncate text-sm font-medium ${highlightId === post.id ? 'text-white' : 'text-neutral-900'}`}>
                    {post.title}
                  </p>
                  <p className={`mt-0.5 text-[10px] uppercase tracking-wide ${highlightId === post.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    {post.type} · {post.status}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    disabled={referencedPostIds.has(post.id)}
                    onClick={() => handlePick(post, 'reference')}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                      referencedPostIds.has(post.id)
                        ? 'cursor-not-allowed opacity-40'
                        : highlightId === post.id
                          ? 'bg-white text-neutral-900 hover:bg-neutral-100'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    {referencedPostIds.has(post.id) ? 'Added' : 'Add ref'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePick(post, 'inline')}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium underline underline-offset-2 ${
                      highlightId === post.id ? 'text-neutral-200 hover:text-white' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Inline
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {postRefs.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">In this post</p>
          {postRefs.map((ref) => (
            <li key={ref.id} className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2">
              <span className="shrink-0 text-xs">📄</span>
              <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">{ref.title}</span>
              <button
                type="button"
                onClick={() => citeReference(ref.id)}
                className="shrink-0 text-xs font-medium text-neutral-700 hover:text-black"
              >
                Cite
              </button>
              <button
                type="button"
                onClick={() => removePostReference(ref.id)}
                className="shrink-0 text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
