import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { getPost, getPostBySlug, incrementPostView } from '../services/posts'
import { recordVisit } from '../services/analytics'
import { useAuthStore, isAdminUser } from '../stores/authStore'
import type { Post } from '../types/post'
import { formatDate } from '../utils/formatDate'
import { getReadingTime } from '../utils/readingTime'

export default function PostView() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>()
  const user = useAuthStore((s) => s.user)
  const isAdmin = isAdminUser(user)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mediaReady, setMediaReady] = useState(false)

  const postKey = slug || id

  useEffect(() => {
    setMediaReady(false)
    const schedule = () => setMediaReady(true)
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(schedule, { timeout: 1200 })
      return () => cancelIdleCallback(id)
    }
    const timer = window.setTimeout(schedule, 200)
    return () => window.clearTimeout(timer)
  }, [post?.id, post?.coverImageUrl])

  useEffect(() => {
    if (!postKey) return
    const loader = slug ? getPostBySlug(slug) : getPost(id!)
    loader
      .then((p) => {
        if (!p || (p.status !== 'published' && !isAdmin)) {
          setError('Post not found.')
          return
        }
        setPost(p)
        if (p.status === 'published') {
          recordVisit(slug ? `/post/s/${p.slug}` : `/post/${p.id}`, p.id)
          incrementPostView(p.id)
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
    url: post ? `${window.location.origin}/post/s/${post.slug}` : undefined,
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
            <ShareButton
              title={post.title}
              slug={post.slug}
              variant="light"
              className="post-reader-nav__share"
            />
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

              <header className="post-reader-hero">
                <div className="post-reader-meta">
                  <span className="post-reader-meta__type">{post.type}</span>
                  <span className="post-reader-meta__dot" aria-hidden="true" />
                  <time dateTime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)}</time>
                  <span className="post-reader-meta__dot" aria-hidden="true" />
                  <span>{readingTime} min read</span>
                  {post.viewCount > 0 && (
                    <>
                      <span className="post-reader-meta__dot" aria-hidden="true" />
                      <span>{post.viewCount} views</span>
                    </>
                  )}
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
                    {mediaReady ? (
                      <img src={post.coverImageUrl} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <div className="post-reader-cover__placeholder" aria-hidden="true" />
                    )}
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
                  <ShareButton title={post.title} slug={post.slug} variant="light" className="w-full justify-center" />
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
