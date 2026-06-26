import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { getAllPosts, deletePost, togglePublish } from '../services/posts'
import type { Post } from '../types/post'
import { formatDate } from '../utils/formatDate'

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()

  const loadPosts = () => {
    setLoading(true)
    getAllPosts()
      .then(setPosts)
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title || 'Untitled'}"? This cannot be undone.`)) return
    try {
      await deletePost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to delete post.')
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
    } catch {
      alert('Failed to update post status.')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-2xl font-bold text-gray-900">Whatz</Link>
          <div className="flex items-center gap-4">
            <Link
              to="/editor/new"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              + New Post
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Dashboard</h1>

        {loading && <p className="text-gray-500">Loading posts...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">No posts yet.</p>
            <Link
              to="/editor/new"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              Create your first post →
            </Link>
          </div>
        )}

        {posts.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="hidden px-4 py-3 font-medium text-gray-600 sm:table-cell">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {post.title || 'Untitled'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/editor/${post.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(post)}
                          className="text-gray-600 hover:underline"
                        >
                          {post.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id, post.title)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
