import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getVisitStats } from '../../services/analytics'
import { getAllPosts } from '../../services/posts'
import { getAllFeedback } from '../../services/feedback'
import type { VisitStats } from '../../types/analytics'
import type { Post } from '../../types/post'

export default function AdminOverview() {
  const [stats, setStats] = useState<VisitStats | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [feedbackCount, setFeedbackCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getVisitStats(), getAllPosts(), getAllFeedback()])
      .then(([visitStats, loadedPosts, feedback]) => {
        setStats(visitStats)
        setPosts(loadedPosts)
        setFeedbackCount(feedback.length)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  const publishedCount = posts.filter((p) => p.status === 'published').length
  const postTitleById = Object.fromEntries(posts.map((p) => [p.id, p.title || 'Untitled']))

  const maxDayCount = Math.max(...(stats?.visitsLast7Days.map((d) => d.count) ?? [1]), 1)

  return (
    <AdminLayout active="overview">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="mt-1 text-sm text-neutral-400">Portfolio performance at a glance</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
      )}

      {loading ? (
        <p className="text-neutral-400">Loading...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total visits', value: stats?.totalVisits ?? 0 },
              { label: 'Home page views', value: stats?.homeVisits ?? 0 },
              { label: 'Published posts', value: publishedCount },
              { label: 'Feedback received', value: feedbackCount },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-medium text-white">Visits — last 7 days</h2>
              <div className="mt-6 flex items-end gap-2 h-32">
                {stats?.visitsLast7Days.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-neutral-500 transition-all"
                      style={{ height: `${Math.max((day.count / maxDayCount) * 100, 4)}%` }}
                      title={`${day.count} visits`}
                    />
                    <span className="text-[10px] text-neutral-500">{day.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-medium text-white">Quick actions</h2>
              <div className="mt-4 space-y-2">
                <Link to="/editor/new" className="block rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-neutral-200">
                  Write a new article
                </Link>
                <Link to="/dashboard/profile" className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-neutral-300 hover:bg-white/5">
                  Edit profile & social links
                </Link>
                <Link to="/" className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-neutral-300 hover:bg-white/5">
                  View public portfolio →
                </Link>
              </div>
              <p className="mt-4 text-xs text-neutral-500">{posts.length} total posts in database</p>
            </div>
          </div>

          {stats && Object.keys(stats.visitsByPost).length > 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-medium text-white">Top articles by views</h2>
              <ul className="mt-4 space-y-2">
                {Object.entries(stats.visitsByPost)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([postId, count]) => (
                    <li key={postId} className="flex items-center justify-between text-sm">
                      <Link to={`/post/${postId}`} className="text-neutral-300 hover:underline truncate max-w-[70%]">
                        {postTitleById[postId] ?? postId}
                      </Link>
                      <span className="text-neutral-500">{count} visits</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}
