import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import PostContent from '../components/PostContent'
import { getPost } from '../services/posts'
import type { Post } from '../types/post'
import { formatDate } from '../utils/formatDate'
import { getReadingTime } from '../utils/readingTime'

export default function PostView() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getPost(id)
      .then((p) => {
        if (!p || p.status !== 'published') {
          setError('Post not found.')
        } else {
          setPost(p)
        }
      })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setLoading(false))
  }, [id])

  const readingTime = post ? getReadingTime(post.content) : 0

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/"
          className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back to home
        </Link>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {post && (
          <article>
            <header className="mb-10">
              <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <time>{formatDate(post.updatedAt)}</time>
                <span>·</span>
                <span>{readingTime} min read</span>
              </div>
              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>
            <PostContent html={post.content} />
          </article>
        )}
      </main>
    </div>
  )
}
