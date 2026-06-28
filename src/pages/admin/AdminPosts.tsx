import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getAllPosts, deletePost, togglePublish, togglePin } from '../../services/posts'
import type { Post, PostStatus } from '../../types/post'
import { formatDate } from '../../utils/formatDate'
import { postUrl } from '../../components/PostCard'

type StatusFilter = 'all' | PostStatus
type TypeFilter = 'all' | 'article' | 'project'

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [tagFilter, setTagFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    getAllPosts()
      .then(setPosts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load posts.'))
      .finally(() => setLoading(false))
  }, [])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach((p) => p.tags.forEach((t) => tags.add(t)))
    return Array.from(tags).sort()
  }, [posts])

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (statusFilter !== 'all' && post.status !== statusFilter) return false
      if (typeFilter !== 'all' && post.type !== typeFilter) return false
      if (tagFilter && !post.tags.includes(tagFilter)) return false
      if (search) {
        const q = search.toLowerCase()
        const haystack = `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (dateFrom) {
        const from = new Date(dateFrom).getTime()
        if (post.updatedAt.getTime() < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 86400000
        if (post.updatedAt.getTime() > to) return false
      }
      return true
    })
  }, [posts, search, statusFilter, tagFilter, typeFilter, dateFrom, dateTo])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title || 'Untitled'}"?`)) return
    try {
      await deletePost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete.')
    }
  }

  const handleTogglePublish = async (post: Post) => {
    if (post.status === 'scheduled') {
      alert('Cancel scheduling in the editor before changing status.')
      return
    }
    try {
      await togglePublish(post.id, post.status)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p,
        ),
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status.')
    }
  }

  const handleTogglePin = async (post: Post) => {
    try {
      await togglePin(post.id, post.pinned)
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, pinned: !p.pinned } : p)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to pin.')
    }
  }

  const copyShareLink = (post: Post) => {
    const url = `${window.location.origin}${postUrl(post)}`
    navigator.clipboard.writeText(url)
    alert('Link copied!')
  }

  return (
    <AdminLayout active="posts">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Posts</h1>
          <p className="mt-1 text-sm text-neutral-400">Create, edit, publish, and share your content</p>
        </div>
        <Link to="/editor/new" className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-neutral-200">
          + New post
        </Link>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, excerpt, tags…"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none">
          <option value="all">All types</option>
          <option value="article">Articles</option>
          <option value="project">Projects</option>
        </select>
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none">
          <option value="">All tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none" title="Updated from" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none" title="Updated to" />
      </div>

      <p className="mb-4 text-sm text-neutral-500">{filtered.length} of {posts.length} posts</p>

      {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
      {loading && <p className="text-neutral-400">Loading posts…</p>}

      {!loading && !error && posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-neutral-400">No posts yet.</p>
          <Link to="/editor/new" className="mt-4 inline-block text-sm text-neutral-300 hover:underline">Create your first post →</Link>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-400">Title</th>
                <th className="px-4 py-3 font-medium text-neutral-400">Type</th>
                <th className="px-4 py-3 font-medium text-neutral-400">Status</th>
                <th className="hidden px-4 py-3 font-medium text-neutral-400 sm:table-cell">Updated</th>
                <th className="px-4 py-3 font-medium text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{post.title || 'Untitled'}</span>
                    {post.pinned && <span className="ml-2 text-xs text-neutral-400">📌</span>}
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-400">{post.type}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      post.status === 'published' ? 'bg-neutral-800 text-neutral-200' : post.status === 'scheduled' ? 'bg-amber-900/40 text-amber-200' : 'bg-neutral-900 text-neutral-400'
                    }`}>{post.status}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">{formatDate(post.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <Link to={`/editor/${post.id}`} className="text-neutral-300 hover:underline">Edit</Link>
                      {post.status === 'published' && (
                        <>
                          <Link to={postUrl(post)} className="text-neutral-400 hover:underline">View</Link>
                          <button type="button" onClick={() => copyShareLink(post)} className="text-neutral-400 hover:underline">Share</button>
                        </>
                      )}
                      <button type="button" onClick={() => handleTogglePin(post)} className="text-neutral-400 hover:underline">
                        {post.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button type="button" onClick={() => handleTogglePublish(post)} className="text-neutral-400 hover:underline">
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button type="button" onClick={() => handleDelete(post.id, post.title)} className="text-red-400 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
