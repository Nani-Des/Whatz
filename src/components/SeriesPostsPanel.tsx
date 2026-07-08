import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllPosts, reorderSeriesPosts, updatePost } from '../services/posts'
import type { Post } from '../types/post'
import type { SeriesRole } from '../types/series'
import { SERIES_ROLE_LABELS } from '../types/series'
import { postUrl } from './PostCard'
import ShareButton from './ShareButton'
import { seriesShareUrl } from '../services/series'
import { nextSeriesIndex, seriesDisplayLabel, seriesHubPath, seriesRoleLabel } from '../utils/series'

interface SeriesPostsPanelProps {
  posts: Post[]
  seriesId: string
  seriesSlug: string
  seriesTitle: string
  onChanged: (posts: Post[]) => void
}

export default function SeriesPostsPanel({
  posts,
  seriesId,
  seriesSlug,
  seriesTitle,
  onChanged,
}: SeriesPostsPanelProps) {
  const [items, setItems] = useState(posts)
  const [availablePosts, setAvailablePosts] = useState<Post[]>([])
  const [selectedPostId, setSelectedPostId] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setItems(posts)
  }, [posts])

  useEffect(() => {
    getAllPosts()
      .then((all) => setAvailablePosts(all.filter((p) => !p.seriesId || p.seriesId === seriesId)))
      .catch(() => setAvailablePosts([]))
  }, [seriesId])

  const addablePosts = useMemo(
    () => availablePosts.filter((p) => !items.some((item) => item.id === p.id)),
    [availablePosts, items],
  )

  const move = (index: number, direction: -1 | 1) => {
    const next = [...items]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    setMessage('')
    try {
      await reorderSeriesPosts(items.map((p) => p.id))
      const reordered = items.map((post, index) => ({ ...post, seriesIndex: index + 1 }))
      setItems(reordered)
      onChanged(reordered)
      setMessage('Order saved')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  const handleAddExisting = async () => {
    if (!selectedPostId) return
    setSaving(true)
    setMessage('')
    try {
      const index = nextSeriesIndex(items)
      await updatePost(selectedPostId, {
        seriesId,
        seriesIndex: index,
        seriesRole: 'devlog',
      })
      const post = availablePosts.find((p) => p.id === selectedPostId)
      if (post) {
        const next = [...items, { ...post, seriesId, seriesIndex: index, seriesRole: 'devlog' as SeriesRole }]
        setItems(next)
        onChanged(next)
      }
      setSelectedPostId('')
      setMessage('Post added to series')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to add post')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (post: Post) => {
    if (!window.confirm(`Remove "${post.title || 'Untitled'}" from this series?`)) return
    setSaving(true)
    setMessage('')
    try {
      await updatePost(post.id, {
        seriesId: null,
        seriesIndex: null,
        seriesLabel: '',
        seriesRole: null,
      })
      const next = items.filter((p) => p.id !== post.id)
      setItems(next)
      onChanged(next)
      setMessage('Removed from series')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to remove post')
    } finally {
      setSaving(false)
    }
  }

  const handleMetaChange = async (
    post: Post,
    fields: { seriesLabel?: string; seriesRole?: SeriesRole | null },
  ) => {
    try {
      await updatePost(post.id, fields)
      const next = items.map((p) => (p.id === post.id ? { ...p, ...fields } : p))
      setItems(next)
      onChanged(next)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update post')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ShareButton
          title={seriesTitle}
          shareUrl={seriesShareUrl(seriesSlug)}
          label="Share series"
          variant="dark"
          className="!px-3 !py-1.5 !text-xs"
        />
        <a
          href={seriesHubPath(seriesSlug)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
        >
          Preview hub
        </a>
        <Link
          to={`/editor/new?seriesId=${seriesId}&fromAdmin=1`}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
        >
          + New post in series
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <label className="min-w-[12rem] flex-1">
          <span className="block text-xs text-neutral-500">Add existing post</span>
          <select
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">Select a post…</option>
            {addablePosts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title || 'Untitled'} ({post.status})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void handleAddExisting()}
          disabled={!selectedPostId || saving}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
        >
          Add to series
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No posts in this series yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((post, index) => (
            <li
              key={post.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3"
            >
              <div className="flex flex-wrap items-start gap-3">
                <span className="w-8 shrink-0 pt-1 text-center text-xs font-medium text-neutral-500">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-sm font-medium text-white">{post.title || 'Untitled'}</p>
                  <p className="text-xs text-neutral-500">
                    {seriesDisplayLabel(post, index)}
                    {post.seriesRole ? ` · ${seriesRoleLabel(post.seriesRole)}` : ''}
                    {' · '}
                    <span className="capitalize">{post.status}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={post.seriesLabel ?? ''}
                      placeholder="Custom label"
                      onChange={(e) => {
                        const value = e.target.value
                        setItems((prev) =>
                          prev.map((p) => (p.id === post.id ? { ...p, seriesLabel: value } : p)),
                        )
                      }}
                      onBlur={() => void handleMetaChange(post, { seriesLabel: post.seriesLabel ?? '' })}
                      className="min-w-[8rem] flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white focus:outline-none"
                    />
                    <select
                      value={post.seriesRole ?? ''}
                      onChange={(e) => {
                        const role = (e.target.value as SeriesRole) || null
                        void handleMetaChange(post, { seriesRole: role })
                      }}
                      className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="">Role…</option>
                      {(Object.keys(SERIES_ROLE_LABELS) as SeriesRole[]).map((role) => (
                        <option key={role} value={role}>
                          {SERIES_ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <Link
                    to={`/editor/${post.id}`}
                    className="rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-white/5 hover:text-white"
                  >
                    Edit
                  </Link>
                  <a
                    href={postUrl(post)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-white/5 hover:text-white"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleRemove(post)}
                    className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-950/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => void handleSaveOrder()}
            disabled={saving}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save order'}
          </button>
        )}
        {message && <span className="text-xs text-neutral-400">{message}</span>}
      </div>
    </div>
  )
}
