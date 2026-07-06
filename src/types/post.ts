export type PostStatus = 'draft' | 'published' | 'scheduled'
export type PostType = 'article' | 'project'
export type ReferenceType = 'upload' | 'link' | 'post'

export type { AnimationPreset, PostAnimationSettings } from './postAnimation'
export { DEFAULT_POST_ANIMATION } from './postAnimation'

import type { PostAnimationSettings } from './postAnimation'

export interface PostReference {
  id: string
  type: ReferenceType
  title: string
  url: string
  fileName?: string
  mimeType?: string
  /** Set when type is `post` */
  postId?: string
  slug?: string
}

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  type: PostType
  status: PostStatus
  pinned: boolean
  viewCount: number
  coverImageUrl: string
  seoTitle: string
  seoDescription: string
  ogImageUrl: string
  references: PostReference[]
  projectDemoUrl: string
  projectRepoUrl: string
  projectTechStack: string[]
  scheduledPublishAt: Date | null
  animation: PostAnimationSettings
  createdAt: Date
  updatedAt: Date
}

export interface PostInput {
  slug?: string
  title: string
  content: string
  excerpt?: string
  tags: string[]
  type?: PostType
  status: PostStatus
  pinned?: boolean
  coverImageUrl?: string
  seoTitle?: string
  seoDescription?: string
  ogImageUrl?: string
  references?: PostReference[]
  projectDemoUrl?: string
  projectRepoUrl?: string
  projectTechStack?: string[]
  scheduledPublishAt?: Date | null
  animation?: PostAnimationSettings
}

export interface PostVersion {
  id: string
  postId: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  createdAt: Date
}
