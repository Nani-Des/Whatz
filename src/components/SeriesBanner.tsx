import { Link } from 'react-router-dom'
import type { Post } from '../types/post'
import type { Series } from '../types/series'
import { seriesDisplayLabel, seriesHubPath } from '../utils/series'

interface SeriesBannerProps {
  series: Series
  post: Post
  siblings: Post[]
}

export default function SeriesBanner({ series, post, siblings }: SeriesBannerProps) {
  const currentIndex = siblings.findIndex((p) => p.id === post.id)
  const partLabel = currentIndex >= 0 ? seriesDisplayLabel(post, currentIndex) : null

  return (
    <div className="series-banner">
      <Link to={seriesHubPath(series.slug)} className="series-banner__link">
        <span className="series-banner__eyebrow">Series</span>
        <span className="series-banner__title">{series.title}</span>
        <span className="series-banner__cta" aria-hidden="true">View all →</span>
      </Link>
      {partLabel && (
        <span className="series-banner__part">{partLabel}</span>
      )}
    </div>
  )
}
