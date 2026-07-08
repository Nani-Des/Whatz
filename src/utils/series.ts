import type { Post } from '../types/post'
import type { SeriesRole } from '../types/series'
import { SERIES_ROLE_LABELS } from '../types/series'

export function sortSeriesPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const ai = a.seriesIndex ?? Number.MAX_SAFE_INTEGER
    const bi = b.seriesIndex ?? Number.MAX_SAFE_INTEGER
    if (ai !== bi) return ai - bi
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })
}

export function seriesDisplayLabel(post: Post, index: number): string {
  if (post.seriesLabel?.trim()) return post.seriesLabel.trim()
  if (post.seriesIndex != null) return `Part ${post.seriesIndex}`
  return `Part ${index + 1}`
}

export function seriesRoleLabel(role: SeriesRole | null | undefined): string {
  if (!role) return 'Post'
  return SERIES_ROLE_LABELS[role] ?? role
}

export function seriesHubPath(slug: string): string {
  return `/series/${slug}`
}

/** @deprecated Use seriesHubPath */
export const projectHubPath = seriesHubPath

export function nextSeriesIndex(posts: Post[]): number {
  const indices = posts.map((p) => p.seriesIndex).filter((n): n is number => typeof n === 'number')
  if (indices.length === 0) return 1
  return Math.max(...indices) + 1
}
