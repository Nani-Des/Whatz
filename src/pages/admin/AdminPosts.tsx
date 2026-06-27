import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getAllPosts, deletePost, togglePublish } from '../../services/posts'
import type { Post } from '../../types/post'
import { formatDate } from '../../utils/formatDate'

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllPosts()
      .then(setPosts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load posts.'))
      .finally(() => setLoading(false))
  }, [])

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
    try {
      await togglePublish(post.id, post.status)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, status: p.status === 'published' ? 'draft' : 'published' }
            : p,
        ),
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status.')
    }
  }

  const copyShareLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`)
    alert('Link copied!')
  }

  return (
    <AdminLayout active="posts">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Posts</h1>
          <p className="mt-1 text-sm text-neutral-400">Create, edit, publish, and share your articles</p>
        </div>
        <Link to="/editor/new" className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-neutral-200">
          + New post
        </Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
      {loading && <p className="text-neutral-400">Loading posts...</p>}

      {!loading && !error && posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-neutral-400">No posts yet.</p>
          <Link to="/editor/new" className="mt-4 inline-block text-sm text-neutral-300 hover:underline">Create your first post →</Link>
        </div>
      )}

      {posts.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-400">Title</th>
                <th className="px-4 py-3 font-medium text-neutral-400">Status</th>
                <th className="hidden px-4 py-3 font-medium text-neutral-400 sm:table-cell">Updated</th>
                <th className="hidden px-4 py-3 font-medium text-neutral-400 md:table-cell">Views</th>
                <th className="px-4 py-3 font-medium text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{post.title || 'Untitled'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.status === 'published' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-900 text-neutral-400'
                    }`}>{post.status}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">{formatDate(post.updatedAt)}</td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">{post.viewCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <Link to={`/editor/${post.id}`} className="text-neutral-300 hover:underline">Edit</Link>
                      {post.status === 'published' && (
                        <>
                          <Link to={`/post/${post.id}`} className="text-neutral-400 hover:underline">View</Link>
                          <button type="button" onClick={() => copyShareLink(post.id)} className="text-neutral-400 hover:underline">Share</button>
                        </>
                      )}
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
