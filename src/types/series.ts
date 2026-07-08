export type SeriesStatus = 'active' | 'complete' | 'paused'

export type SeriesRole = 'overview' | 'devlog' | 'deep-dive' | 'launch' | 'retrospective' | 'other'

export const SERIES_ROLE_LABELS: Record<SeriesRole, string> = {
  overview: 'Overview',
  devlog: 'Devlog',
  'deep-dive': 'Deep dive',
  launch: 'Launch',
  retrospective: 'Retrospective',
  other: 'Other',
}

export interface Series {
  id: string
  slug: string
  title: string
  description: string
  excerpt: string
  coverImageUrl: string
  demoUrl: string
  repoUrl: string
  techStack: string[]
  status: SeriesStatus
  featured: boolean
  overviewPostId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SeriesInput {
  slug?: string
  title: string
  description?: string
  excerpt?: string
  coverImageUrl?: string
  demoUrl?: string
  repoUrl?: string
  techStack?: string[]
  status?: SeriesStatus
  featured?: boolean
  overviewPostId?: string | null
}
