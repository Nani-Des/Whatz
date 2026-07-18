import { Link } from 'react-router-dom'
import ResponsiveImage, { CARD_SIZES } from './ResponsiveImage'
import type { Series } from '../types/series'
import { seriesHubPath } from '../utils/series'

interface SeriesCardProps {
  series: Series
  postCount?: number
}

export default function SeriesCard({ series, postCount }: SeriesCardProps) {
  const excerpt = series.excerpt || series.description
  const statusLabel = series.status === 'complete' ? 'Complete' : series.status === 'paused' ? 'Paused' : 'Active'

  return (
    <article className={`series-card group overflow-hidden rounded-2xl border bg-neutral-950 transition-all duration-300 hover:bg-neutral-900 ${
      series.featured ? 'border-neutral-500 ring-1 ring-neutral-600' : 'border-neutral-800 hover:border-neutral-600'
    }`}>
      <Link to={seriesHubPath(series.slug)} className="block">
        {series.coverImageUrl && (
          <ResponsiveImage
            src={series.coverImageUrl}
            alt=""
            className="h-40 w-full object-cover"
            preferredSize="small"
            sizes={CARD_SIZES}
          />
        )}
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {series.featured && (
              <>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-300">Featured</span>
                <span>·</span>
              </>
            )}
            <span>{statusLabel}</span>
            {postCount != null && postCount > 0 && (
              <>
                <span>·</span>
                <span>{postCount} {postCount === 1 ? 'post' : 'posts'}</span>
              </>
            )}
          </div>

          <h2 className="mt-3 text-xl font-semibold leading-snug text-white transition-colors group-hover:text-neutral-200 sm:text-2xl">
            {series.title || 'Untitled series'}
          </h2>

          {excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-400">{excerpt}</p>
          )}

          {series.techStack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {series.techStack.slice(0, 4).map((tech) => (
                <span key={tech} className="rounded border border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">{tech}</span>
              ))}
            </div>
          )}

          <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-neutral-300 group-hover:text-white">
            View series
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </Link>
    </article>
  )
}
