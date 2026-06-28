import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PostContent from '../components/PostContent'
import PostReferences from '../components/PostReferences'
import FeedbackForm from '../components/FeedbackForm'
import ShareButton from '../components/ShareButton'
import FirestoreSetupBanner from '../components/FirestoreSetupBanner'
import TableOfContents, { extractHeadings, injectHeadingIds } from '../components/TableOfContents'
import ReadingProgressBar from '../components/ReadingProgressBar'
import { useSEO } from '../hooks/useSEO'
import { getPost, getPostBySlug, incrementPostView } from '../services/posts'
import { recordVisit } from '../services/analytics'
import { useAuthStore, isAdminUser } from '../stores/authStore'
import type { Post } from '../types/post'
import { formatDate } from '../utils/formatDate'
import { getReadingTime } from '../utils/readingTime'

function MetaPill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 ${className}`}>
      {children}
    </span>
  )
}

export default function PostView() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>()
  const user = useAuthStore((s) => s.user)
  const isAdmin = isAdminUser(user)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const postKey = slug || id

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

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <ReadingProgressBar />

      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
          <Link
            to="/"
            className="group flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-black"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            <span>Portfolio</span>
          </Link>
          {post && <ShareButton title={post.title} slug={post.slug} variant="light" />}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-8 sm:pt-12">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-neutral-400">Loading article…</p>
          </div>
        )}

        {error && (
          <div className="mb-8">
            <FirestoreSetupBanner message={error} />
          </div>
        )}

        {post && (
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16 xl:gap-20">
            <article className="min-w-0">
              {post.status === 'draft' && isAdmin && (
                <div className="mb-8 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                  Draft preview — only visible to you.{' '}
                  <Link to={`/editor/${post.id}`} className="font-medium text-black underline underline-offset-2 hover:text-neutral-700">
                    Edit post
                  </Link>
                </div>
              )}

              <header className="mb-10 sm:mb-12">
                <div className="flex flex-wrap items-center gap-2">
                  <MetaPill className="capitalize">{post.type}</MetaPill>
                  <span className="text-xs text-neutral-400">·</span>
                  <time className="text-xs font-medium text-neutral-500">{formatDate(post.updatedAt)}</time>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs font-medium text-neutral-500">{readingTime} min read</span>
                  {post.viewCount > 0 && (
                    <>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs font-medium text-neutral-500">{post.viewCount} views</span>
                    </>
                  )}
                </div>

                <h1 className="mt-6 text-[2rem] font-semibold leading-[1.15] tracking-tight text-black sm:text-4xl lg:text-[2.75rem]">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
                    {post.excerpt}
                  </p>
                )}

                {post.type === 'project' && (post.projectDemoUrl || post.projectRepoUrl) && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    {post.projectDemoUrl && (
                      <a
                        href={post.projectDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                      >
                        View demo
                        <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {post.projectRepoUrl && (
                      <a
                        href={post.projectRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                      >
                        Source code
                      </a>
                    )}
                  </div>
                )}

                {(post.projectTechStack.length > 0 || post.tags.length > 0) && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.projectTechStack.map((tech) => (
                      <MetaPill key={tech}>{tech}</MetaPill>
                    ))}
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {post.coverImageUrl && (
                <figure className="mb-10 sm:mb-12">
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="w-full rounded-2xl object-cover shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-neutral-200/80 max-h-[28rem]"
                  />
                </figure>
              )}

              <div className="post-reader">
                <PostContent html={post.content} references={post.references} onHeadingsReady={handleHeadingsReady} />
              </div>

              <PostReferences references={post.references} />

              {post.status === 'published' && (
                <div className="mt-16 border-t border-neutral-200 pt-12 sm:mt-20 sm:pt-16">
                  <FeedbackForm postId={post.id} postTitle={post.title} variant="light" />
                </div>
              )}
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-6">
                {headings.length >= 3 && (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5">
                    <TableOfContents headings={headings} variant="light" />
                  </div>
                )}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Share</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Found this useful? Pass it along.
                  </p>
                  <div className="mt-4">
                    <ShareButton title={post.title} slug={post.slug} variant="light" className="w-full justify-center" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-8">
          <p className="text-xs text-neutral-400">Whatz</p>
          <Link to="/" className="text-xs font-medium text-neutral-500 hover:text-black">
            Back to portfolio
          </Link>
        </div>
      </footer>
    </div>
  )
}
