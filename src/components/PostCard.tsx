import { Link } from 'react-router-dom'
import type { Post } from '../types/post'
import { getExcerpt } from '../utils/excerpt'
import { formatDate } from '../utils/formatDate'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/post/${post.id}`} className="block">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {post.title || 'Untitled'}
        </h2>
        <p className="mt-2 text-sm text-gray-500">{formatDate(post.updatedAt)}</p>
        <p className="mt-3 text-gray-600 leading-relaxed">
          {getExcerpt(post.content)}
        </p>
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
        <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:underline">
          Read more →
        </span>
      </Link>
    </article>
  )
}
