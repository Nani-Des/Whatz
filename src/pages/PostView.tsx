import { useCallback, useEffect, useMemo, useState } from 'react'
import ResponsiveImage, { COVER_SIZES } from '../components/ResponsiveImage'
import PostAmbientBackground from '../components/PostAmbientBackground'
import { Link, useParams } from 'react-router-dom'
import PostContent from '../components/PostContent'
import PostReferences from '../components/PostReferences'
import FeedbackForm from '../components/FeedbackForm'
import ShareButton from '../components/ShareButton'
import FirestoreSetupBanner from '../components/FirestoreSetupBanner'
import TableOfContents, { extractHeadings, injectHeadingIds } from '../components/TableOfContents'
import MobileTableOfContents from '../components/MobileTableOfContents'
import ReadingProgressBar from '../components/ReadingProgressBar'
import { useSEO } from '../hooks/useSEO'
import { animationClass } from '../hooks/useScrollReveal'
import { resolvePostAnimation } from '../types/postAnimation'
import SeriesBanner from '../components/SeriesBanner'
import SeriesNav from '../components/SeriesNav'
import { getPost, getPostBySlug, getPostsBySeriesId, incrementPostView } from '../services/posts'
import { getSeries, seriesShareUrl } from '../services/series'
import { recordVisit } from '../services/analytics'
import { postShareUrl } from '../utils/postLinks'
import { useAuthStore, isAdminUser } from '../stores/authStore'
import type { Post } from '../types/post'
import type { Series } from '../types/series'
import { formatDate } from '../utils/formatDate'
import { getReadingTime } from '../utils/readingTime'

export default function PostView() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>()
  const user = useAuthStore((s) => s.user)
  const isAdmin = isAdminUser(user)
  const [post, setPost] = useState<Post | null>(null)
  const [series, setSeries] = useState<Series | null>(null)
  const [seriesSiblings, setSeriesSiblings] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const postKey = slug || id

  useEffect(() => {
    if (!postKey) return
    setLoading(true)
    setError('')
    setSeries(null)
    setSeriesSiblings([])
    const loader = slug ? getPostBySlug(slug) : getPost(id!)
    loader
      .then((p) => {
        if (!p || (p.status !== 'published' && !isAdmin)) {
          setError('Post not found.')
          return
        }
        setPost(p)
        if (p.seriesId) {
          getSeries(p.seriesId)
            .then((loaded) => {
              if (loaded) setSeries(loaded)
            })
            .catch(() => {})
          getPostsBySeriesId(p.seriesId, !isAdmin)
            .then((siblings) => {
              const visible = isAdmin ? siblings : siblings.filter((s) => s.status === 'published')
              setSeriesSiblings(visible)
            })
            .catch(() => setSeriesSiblings([]))
        } else {
          setSeries(null)
          setSeriesSiblings([])
        }
        if (p.status === 'published') {
          recordVisit(slug ? `/post/s/${p.slug}` : `/post/${p.id}`, p.id)
          incrementPostView(p.id)
          setPost({ ...p, viewCount: p.viewCount + 1 })
          return
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load post.'))
      .finally(() => setLoading(false))
  }, [postKey, id, slug, isAdmin])

  const headings = useMemo(() => (post ? extractHeadings(post.content) : []), [post])

  const handleHeadingsReady = useCallback(
    (container: HTMLElement) => injectHeadingIds(container, headings),
    [headings],
  )

  useSEO({
    title: post?.seoTitle || post?.title || 'Post',
    description: post?.seoDescription || post?.excerpt,
    image: post?.ogImageUrl || post?.coverImageUrl,
    url: post ? postShareUrl(post) : undefined,
    preloadImage: false,
  })

  const readingTime = post ? getReadingTime(post.content) : 0
  const anim = post ? resolvePostAnimation(post.animation) : null

  const pageClasses = [
    'post-reader-page',
    'min-h-screen',
    anim ? animationClass(anim) : '',
    anim?.heroEntrance ? 'post-anim-hero' : '',
    anim?.coverKenBurns ? 'post-anim-cover-drift' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={pageClasses}>
      <PostAmbientBackground enabled={!!anim?.ambientBackground} />
      <ReadingProgressBar />

      <header className="post-reader-nav">
        <div className="post-reader-nav__inner">
          <Link to="/" className="post-reader-nav__back">
            <span aria-hidden="true">←</span>
            <span>Portfolio</span>
          </Link>
          {post && (
            <div className="post-reader-nav__share-group">
              <ShareButton
                title={post.title}
                slug={post.slug}
                postId={post.id}
                label="Share post"
                variant="light"
                className="post-reader-nav__share"
              />
              {series && (
                <ShareButton
                  title={series.title}
                  shareUrl={seriesShareUrl(series.slug)}
                  label="Share series"
                  variant="light"
                  className="post-reader-nav__share"
                />
              )}
            </div>
          )}
        </div>
      </header>

      <main className="post-reader-main">
        {loading && (
          <div className="post-reader-loading">
            <p>Loading article…</p>
          </div>
        )}

        {error && (
          <div className="post-reader-error">
            <FirestoreSetupBanner message={error} />
          </div>
        )}

        {post && (
          <div className="post-reader-layout">
            <article className="post-reader-article">
              {post.status === 'draft' && isAdmin && (
                <div className="post-reader-draft-banner">
                  Draft preview — only visible to you.{' '}
                  <Link to={`/editor/${post.id}`}>Edit post</Link>
                </div>
              )}

              {series && post.seriesId && (
                <SeriesBanner series={series} post={post} siblings={seriesSiblings} />
              )}

              <header className="post-reader-hero">
                <div className="post-reader-meta">
                  <span className="post-reader-meta__type">{post.type}</span>
                  <span className="post-reader-meta__dot" aria-hidden="true" />
                  <time dateTime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)}</time>
                  <span className="post-reader-meta__dot" aria-hidden="true" />
                  <span>{readingTime} min read</span>
                  <span className="post-reader-meta__dot" aria-hidden="true" />
                  <span className="post-reader-meta__views">
                    {post.viewCount.toLocaleString()} {post.viewCount === 1 ? 'view' : 'views'}
                  </span>
                </div>

                <h1 className="post-title">{post.title}</h1>

                {post.excerpt && (
                  <p className="post-excerpt">{post.excerpt}</p>
                )}

                {post.type === 'project' && (post.projectDemoUrl || post.projectRepoUrl) && (
                  <div className="post-reader-actions">
                    {post.projectDemoUrl && (
                      <a href={post.projectDemoUrl} target="_blank" rel="noopener noreferrer" className="post-reader-btn post-reader-btn--primary">
                        View demo →
                      </a>
                    )}
                    {post.projectRepoUrl && (
                      <a href={post.projectRepoUrl} target="_blank" rel="noopener noreferrer" className="post-reader-btn post-reader-btn--secondary">
                        Source code
                      </a>
                    )}
                  </div>
                )}

                {(post.projectTechStack.length > 0 || post.tags.length > 0) && (
                  <div className="post-reader-tags">
                    {post.projectTechStack.map((tech) => (
                      <span key={tech} className="post-reader-tag">{tech}</span>
                    ))}
                    {post.tags.map((tag) => (
                      <span key={tag} className="post-reader-tag post-reader-tag--outline">{tag}</span>
                    ))}
                  </div>
                )}
              </header>

              {post.coverImageUrl && (
                <figure className={`post-reader-cover${anim?.coverKenBurns ? ' post-reader-cover--animated' : ''}`}>
                  <div className="post-reader-cover__frame">
                    <ResponsiveImage
                      src={post.coverImageUrl}
                      alt=""
                      loading="eager"
                      fetchPriority="high"
                      preferredSize="medium"
                      sizes={COVER_SIZES}
                    />
                  </div>
                </figure>
              )}

              <div className="post-reader-divider" aria-hidden="true" />

              <MobileTableOfContents headings={headings} />

              <div className="post-reader">
                <PostContent
                  html={post.content}
                  references={post.references}
                  onHeadingsReady={handleHeadingsReady}
                  scrollReveal={anim?.scrollReveal ?? false}
                  staggerContent={anim?.staggerContent ?? false}
                />
              </div>

              <PostReferences references={post.references} reveal={anim?.revealReferences ?? false} />

              {series && post.seriesId && (
                <SeriesNav series={series} post={post} siblings={seriesSiblings} />
              )}

              {post.status === 'published' && (
                <div className="post-reader-feedback">
                  <FeedbackForm postId={post.id} postTitle={post.title} variant="light" />
                </div>
              )}
            </article>

            <aside className="post-reader-aside">
              <div className="post-reader-aside__sticky">
                {headings.length >= 3 && (
                  <div className="post-reader-aside__card">
                    <TableOfContents headings={headings} variant="light" />
                  </div>
                )}
                <div className="post-reader-aside__card post-reader-aside__card--share">
                  <p className="post-reader-aside__label">Share</p>
                  <p className="post-reader-aside__hint">Found this useful? Pass it along.</p>
                  <ShareButton title={post.title} slug={post.slug} postId={post.id} variant="light" className="w-full justify-center" />
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="post-reader-footer">
        <div className="post-reader-footer__inner">
          <span>Whatz</span>
          <Link to="/">Back to portfolio</Link>
        </div>
      </footer>
    </div>
  )
}
