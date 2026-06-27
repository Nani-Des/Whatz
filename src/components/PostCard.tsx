import { Link } from 'react-router-dom'
import type { Post } from '../types/post'
import { getExcerpt } from '../utils/excerpt'
import { formatDate } from '../utils/formatDate'
import { getReadingTime } from '../utils/readingTime'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const readingTime = getReadingTime(post.content)

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-900">
      <Link to={`/post/${post.id}`} className="block p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
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

        <h2 className="mt-3 text-xl font-semibold leading-snug text-white transition-colors group-hover:text-neutral-200 sm:text-2xl">
          {post.title || 'Untitled'}
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-400">
          {getExcerpt(post.content, 160)}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-neutral-300 group-hover:text-white">
          Read article
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </Link>
    </article>
  )
}
