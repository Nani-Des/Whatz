import { Link } from 'react-router-dom'
import type { Post } from '../types/post'
import type { Series } from '../types/series'
import { postUrl } from './PostCard'
import { seriesHubPath, seriesRoleLabel } from '../utils/series'

interface SeriesNavProps {
  series: Series
  post: Post
  siblings: Post[]
}

export default function SeriesNav({ series, post, siblings }: SeriesNavProps) {
  const currentIndex = siblings.findIndex((p) => p.id === post.id)
  const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null
  const next = currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null

  if (!prev && !next) return null

  return (
    <nav className="series-nav" aria-label="Series navigation">
      <div className="series-nav__links">
        {prev ? (
          <Link to={postUrl(prev)} className="series-nav__link series-nav__link--prev">
            <span className="series-nav__link-label">← Previous</span>
            <span className="series-nav__link-title">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        <Link to={seriesHubPath(series.slug)} className="series-nav__hub">
          All in series
        </Link>
        {next ? (
          <Link to={postUrl(next)} className="series-nav__link series-nav__link--next">
            <span className="series-nav__link-label">Next →</span>
            <span className="series-nav__link-title">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
      {post.seriesRole && (
        <p className="series-nav__meta">
          {seriesRoleLabel(post.seriesRole)}
          {siblings.length > 1 && currentIndex >= 0 && (
            <span> · {currentIndex + 1} of {siblings.length}</span>
          )}
        </p>
      )}
    </nav>
  )
}
