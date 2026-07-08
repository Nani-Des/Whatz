import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import SeriesPostsPanel from '../../components/SeriesPostsPanel'
import ShareButton from '../../components/ShareButton'
import { getAllSeries, deleteSeries, seriesShareUrl } from '../../services/series'
import { getPostsBySeriesId, clearSeriesFromPosts } from '../../services/posts'
import type { Series } from '../../types/series'
import { seriesHubPath } from '../../utils/series'
import { formatDate } from '../../utils/formatDate'

export default function AdminSeries() {
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [postCounts, setPostCounts] = useState<Record<string, number>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [seriesPosts, setSeriesPosts] = useState<Record<string, import('../../types/post').Post[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllSeries()
      .then(async (loaded) => {
        setSeriesList(loaded)
        const counts: Record<string, number> = {}
        await Promise.all(
          loaded.map(async (item) => {
            const posts = await getPostsBySeriesId(item.id)
            counts[item.id] = posts.length
          }),
        )
        setPostCounts(counts)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load series.'))
      .finally(() => setLoading(false))
  }, [])

  const sorted = useMemo(
    () =>
      [...seriesList].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      }),
    [seriesList],
  )

  const toggleExpand = async (seriesId: string) => {
    if (expandedId === seriesId) {
      setExpandedId(null)
      return
    }
    setExpandedId(seriesId)
    if (!seriesPosts[seriesId]) {
      const posts = await getPostsBySeriesId(seriesId)
      setSeriesPosts((prev) => ({ ...prev, [seriesId]: posts }))
    }
  }

  const handleDelete = async (item: Series) => {
    if (
      !window.confirm(
        `Delete "${item.title}"?\n\nLinked posts will be unlinked (not deleted).`,
      )
    ) {
      return
    }
    try {
      await clearSeriesFromPosts(item.id)
      await deleteSeries(item.id)
      setSeriesList((prev) => prev.filter((s) => s.id !== item.id))
      if (expandedId === item.id) setExpandedId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete series.')
    }
  }

  return (
    <AdminLayout active="series">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Series</h1>
          <p className="mt-1 text-sm text-neutral-400">Create hubs, manage order, and share full series</p>
        </div>
        <Link
          to="/dashboard/series/new"
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-neutral-200"
        >
          + New series
        </Link>
      </div>

      {loading && <p className="text-neutral-400">Loading series…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && sorted.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-neutral-500">No series yet.</p>
          <Link to="/dashboard/series/new" className="mt-4 inline-block text-sm text-neutral-300 hover:text-white">
            Create your first series →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="capitalize">{item.status}</span>
                  {item.featured && (
                    <>
                      <span>·</span>
                      <span className="text-neutral-300">Featured</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{postCounts[item.id] ?? 0} posts</span>
                  <span>·</span>
                  <span>Updated {formatDate(item.updatedAt)}</span>
                </div>
                <h2 className="mt-1 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-1 text-sm text-neutral-500">/series/{item.slug}</p>
                {(item.excerpt || item.description) && (
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-400">
                    {item.excerpt || item.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <ShareButton
                  title={item.title}
                  shareUrl={seriesShareUrl(item.slug)}
                  label="Share"
                  variant="dark"
                  className="!px-3 !py-1.5 !text-xs"
                />
                <a
                  href={seriesHubPath(item.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
                >
                  View hub
                </a>
                <Link
                  to={`/editor/new?seriesId=${item.id}&fromAdmin=1`}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
                >
                  + Post
                </Link>
                <Link
                  to={`/dashboard/series/${item.id}`}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => void toggleExpand(item.id)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5"
                >
                  {expandedId === item.id ? 'Hide posts' : 'Manage posts'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(item)}
                  className="rounded-lg border border-red-900/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/30"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedId === item.id && (
              <div className="border-t border-white/10 px-4 py-4 sm:px-5">
                <SeriesPostsPanel
                  seriesId={item.id}
                  seriesSlug={item.slug}
                  seriesTitle={item.title}
                  posts={seriesPosts[item.id] ?? []}
                  onChanged={(posts) => {
                    setSeriesPosts((prev) => ({ ...prev, [item.id]: posts }))
                    setPostCounts((prev) => ({ ...prev, [item.id]: posts.length }))
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
