export type PostStatus = 'draft' | 'published' | 'scheduled'
export type PostType = 'article' | 'project'
export type ReferenceType = 'upload' | 'link'

export interface PostReference {
  id: string
  type: ReferenceType
  title: string
  url: string
  fileName?: string
  mimeType?: string
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
