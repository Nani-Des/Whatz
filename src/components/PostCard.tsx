import { Link } from 'react-router-dom'
import ResponsiveImage, { CARD_SIZES } from './ResponsiveImage'
import type { Post } from '../types/post'
import { getExcerpt } from '../utils/excerpt'
import { formatDate } from '../utils/formatDate'
import { getReadingTime } from '../utils/readingTime'

interface PostCardProps {
  post: Post
  seriesHint?: string
}

function postUrl(post: Post): string {
  return post.slug ? `/post/s/${post.slug}` : `/post/${post.id}`
}

export default function PostCard({ post, seriesHint }: PostCardProps) {
  const readingTime = getReadingTime(post.content)
  const excerpt = post.excerpt || getExcerpt(post.content, 160)
  const isLegacyProject = post.type === 'project' && !post.seriesId
  const isSeriesPost = Boolean(post.seriesId)

  return (
    <article className={`group overflow-hidden rounded-2xl border bg-neutral-950 transition-all duration-300 hover:bg-neutral-900 ${
      post.pinned ? 'border-neutral-500 ring-1 ring-neutral-600' : 'border-neutral-800 hover:border-neutral-600'
    }`}>
      <Link to={postUrl(post)} className="block">
        {post.coverImageUrl && (
          <ResponsiveImage
            src={post.coverImageUrl}
            alt=""
            className="h-40 w-full object-cover"
            preferredSize="small"
            sizes={CARD_SIZES}
          />
        )}
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {post.pinned && (
              <>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-300">Pinned</span>
                <span>·</span>
              </>
            )}
            <span className="capitalize">
              {isLegacyProject ? 'Project' : isSeriesPost ? 'Series' : 'Article'}
            </span>
            {seriesHint && (
              <>
                <span>·</span>
                <span>{seriesHint}</span>
              </>
            )}
            <span>·</span>
            <time>{formatDate(post.updatedAt)}</time>
            <span>·</span>
            <span>{readingTime} min read</span>
          </div>

          <h2 className="mt-3 text-xl font-semibold leading-snug text-white transition-colors group-hover:text-neutral-200 sm:text-2xl">
            {post.title || 'Untitled'}
          </h2>

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-400">{excerpt}</p>

          {isLegacyProject && post.projectTechStack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.projectTechStack.slice(0, 4).map((tech) => (
                <span key={tech} className="rounded border border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">{tech}</span>
              ))}
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-400">{tag}</span>
              ))}
            </div>
          )}

          <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-neutral-300 group-hover:text-white">
            {isLegacyProject ? 'View project' : 'Read article'}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </Link>
    </article>
  )
}

export { postUrl }
