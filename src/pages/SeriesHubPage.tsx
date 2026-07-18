import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ResponsiveImage, { COVER_SIZES } from '../components/ResponsiveImage'
import FirestoreSetupBanner from '../components/FirestoreSetupBanner'
import ShareButton from '../components/ShareButton'
import { postUrl } from '../components/PostCard'
import { useSEO } from '../hooks/useSEO'
import { getSeriesBySlug, seriesShareUrl } from '../services/series'
import { getPostsBySeriesId } from '../services/posts'
import { recordVisit } from '../services/analytics'
import { useAuthStore, isAdminUser } from '../stores/authStore'
import type { Post } from '../types/post'
import type { Series } from '../types/series'
import { formatDate } from '../utils/formatDate'
import { seriesDisplayLabel, seriesHubPath, seriesRoleLabel } from '../utils/series'
import { getReadingTime } from '../utils/readingTime'

export default function SeriesHubPage() {
  const { slug } = useParams<{ slug: string }>()
  const user = useAuthStore((s) => s.user)
  const isAdmin = isAdminUser(user)
  const [series, setSeries] = useState<Series | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    getSeriesBySlug(slug)
      .then(async (loaded) => {
        if (!loaded || (loaded.status === 'paused' && !isAdmin)) {
          setError('Series not found.')
          return
        }
        setSeries(loaded)
        const seriesPosts = await getPostsBySeriesId(loaded.id, !isAdmin)
        const visible = isAdmin ? seriesPosts : seriesPosts.filter((p) => p.status === 'published')
        setPosts(visible)
        recordVisit(seriesHubPath(slug), loaded.id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load series.'))
      .finally(() => setLoading(false))
  }, [slug, isAdmin])

  useSEO({
    title: series?.title ?? 'Series',
    description: series?.excerpt || series?.description,
    image: series?.coverImageUrl,
    url: slug ? seriesShareUrl(slug) : undefined,
    type: 'website',
  })

  const statusLabel =
    series?.status === 'complete' ? 'Complete' : series?.status === 'paused' ? 'Paused' : 'Active'

  return (
    <div className="series-hub-page min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">
            Whatz
          </Link>
          {series && (
            <ShareButton
              title={series.title}
              shareUrl={seriesShareUrl(series.slug)}
              label="Share series"
              variant="dark"
            />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {loading && (
          <div className="space-y-4">
            <div className="h-12 w-2/3 animate-pulse rounded-xl bg-neutral-900" />
            <div className="h-48 animate-pulse rounded-2xl bg-neutral-900" />
          </div>
        )}

        {error && <FirestoreSetupBanner message={error} />}

        {series && !error && (
          <>
            <div className="series-hub-hero">
              {series.coverImageUrl && (
                <figure className="series-hub-hero__cover">
                  <ResponsiveImage
                    src={series.coverImageUrl}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    preferredSize="medium"
                    sizes={COVER_SIZES}
                  />
                </figure>
              )}
              <div className="series-hub-hero__body">
                <div className="series-hub-hero__meta">
                  <span className="series-hub-hero__status">{statusLabel}</span>
                  {series.featured && (
                    <span className="series-hub-hero__featured">Featured</span>
                  )}
                  {posts.length > 0 && (
                    <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
                  )}
                </div>
                <h1 className="series-hub-hero__title">{series.title}</h1>
                {(series.excerpt || series.description) && (
                  <p className="series-hub-hero__description">
                    {series.excerpt || series.description}
                  </p>
                )}
                {(series.demoUrl || series.repoUrl) && (
                  <div className="series-hub-hero__actions">
                    {series.demoUrl && (
                      <a href={series.demoUrl} target="_blank" rel="noopener noreferrer" className="series-hub-hero__btn series-hub-hero__btn--primary">
                        View demo →
                      </a>
                    )}
                    {series.repoUrl && (
                      <a href={series.repoUrl} target="_blank" rel="noopener noreferrer" className="series-hub-hero__btn series-hub-hero__btn--secondary">
                        Source code
                      </a>
                    )}
                  </div>
                )}
                {series.techStack.length > 0 && (
                  <div className="series-hub-hero__stack">
                    {series.techStack.map((tech) => (
                      <span key={tech} className="series-hub-hero__tag">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <section className="series-hub-timeline">
              <div className="series-hub-timeline__header">
                <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">Timeline</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">All posts in this series</h2>
              </div>

              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
                  <p className="text-neutral-500">No published posts in this series yet.</p>
                  {isAdmin && (
                    <Link
                      to={`/editor/new?seriesId=${series.id}&fromAdmin=1`}
                      className="mt-4 inline-block text-sm text-neutral-300 hover:text-white"
                    >
                      Add first post →
                    </Link>
                  )}
                </div>
              ) : (
                <ol className="series-hub-timeline__list">
                  {posts.map((post, index) => (
                    <li key={post.id} className="series-hub-timeline__item">
                      <div className="series-hub-timeline__marker" aria-hidden="true">
                        <span>{post.seriesIndex ?? index + 1}</span>
                      </div>
                      <article className="series-hub-timeline__card">
                        <div className="series-hub-timeline__card-meta">
                          <span>{seriesDisplayLabel(post, index)}</span>
                          {post.seriesRole && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{seriesRoleLabel(post.seriesRole)}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <time dateTime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)}</time>
                          <span aria-hidden="true">·</span>
                          <span>{getReadingTime(post.content)} min read</span>
                          {post.status !== 'published' && isAdmin && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="capitalize text-amber-400">{post.status}</span>
                            </>
                          )}
                        </div>
                        <h3 className="series-hub-timeline__card-title">
                          <Link to={postUrl(post)}>{post.title || 'Untitled'}</Link>
                        </h3>
                        {post.excerpt && (
                          <p className="series-hub-timeline__card-excerpt">{post.excerpt}</p>
                        )}
                        <div className="series-hub-timeline__card-actions">
                          <Link to={postUrl(post)} className="series-hub-timeline__card-link">
                            Read →
                          </Link>
                          <ShareButton
                            title={post.title}
                            slug={post.slug}
                            label="Share post"
                            variant="dark"
                            className="!px-3 !py-1 !text-xs !border-neutral-700"
                          />
                        </div>
                      </article>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
