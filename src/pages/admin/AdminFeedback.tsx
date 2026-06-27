import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getAllFeedback, deleteFeedback } from '../../services/feedback'
import type { Feedback } from '../../types/feedback'
import { formatDate } from '../../utils/formatDate'

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllFeedback()
      .then(setFeedback)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load feedback.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feedback?')) return
    try {
      await deleteFeedback(id)
      setFeedback((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete.')
    }
  }

  return (
    <AdminLayout active="feedback">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Feedback</h1>
        <p className="mt-1 text-sm text-neutral-400">Messages from readers on your articles</p>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
      {loading && <p className="text-neutral-400">Loading feedback...</p>}

      {!loading && !error && feedback.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-neutral-400">
          No feedback yet. Readers can leave comments at the bottom of published posts.
        </div>
      )}

      <div className="space-y-4">
        {feedback.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{item.name}</p>
                {item.email && <p className="text-xs text-neutral-500">{item.email}</p>}
              </div>
              <time className="text-xs text-neutral-500">{formatDate(item.createdAt)}</time>
            </div>
            <Link to={`/post/${item.postId}`} className="mt-2 inline-block text-sm text-neutral-300 hover:underline">
              Re: {item.postTitle || 'Untitled'}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">{item.message}</p>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="mt-4 text-xs text-red-400 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
