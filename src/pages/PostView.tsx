import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PostContent from '../components/PostContent'
import FeedbackForm from '../components/FeedbackForm'
import ShareButton from '../components/ShareButton'
import FirestoreSetupBanner from '../components/FirestoreSetupBanner'
import { getPost, incrementPostView } from '../services/posts'
import { recordVisit } from '../services/analytics'
import { useAuthStore, isAdminUser } from '../stores/authStore'
import type { Post } from '../types/post'
import { formatDate } from '../utils/formatDate'
import { getReadingTime } from '../utils/readingTime'

export default function PostView() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const isAdmin = isAdminUser(user)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getPost(id)
      .then((p) => {
        if (!p || (p.status !== 'published' && !isAdmin)) {
          setError('Post not found.')
          return
        }
        setPost(p)
        if (p.status === 'published') {
          recordVisit(`/post/${id}`, id)
          incrementPostView(id)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load post.'))
      .finally(() => setLoading(false))
  }, [id, isAdmin])

  const readingTime = post ? getReadingTime(post.content) : 0

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-sm font-medium text-neutral-400 transition-colors hover:text-white">
            ← Back to portfolio
          </Link>
          {post && <ShareButton title={post.title} />}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {loading && <p className="text-neutral-400">Loading...</p>}
        {error && <FirestoreSetupBanner message={error} />}

        {post && (
          <>
            {post.status === 'draft' && isAdmin && (
              <div className="mb-6 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
                Draft preview — only visible to you.{' '}
                <Link to={`/editor/${post.id}`} className="underline hover:text-white">Edit post</Link>
              </div>
            )}

            <article>
              <header className="mb-10">
                <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                  <time>{formatDate(post.updatedAt)}</time>
                  <span>·</span>
                  <span>{readingTime} min read</span>
                  {post.viewCount > 0 && (
                    <>
                      <span>·</span>
                      <span>{post.viewCount} views</span>
                    </>
                  )}
                </div>

                <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {post.title}
                </h1>

                {post.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neutral-800 px-3 py-0.5 text-xs font-medium text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <div className="post-content-dark">
                <PostContent html={post.content} />
              </div>
            </article>

            {post.status === 'published' && (
              <div className="mt-16 border-t border-neutral-800 pt-12">
                <FeedbackForm postId={post.id} postTitle={post.title} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
