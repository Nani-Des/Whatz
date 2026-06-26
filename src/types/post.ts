export type PostStatus = 'draft' | 'published'

export interface Post {
  id: string
  title: string
  content: string
  tags: string[]
  status: PostStatus
  createdAt: Date
  updatedAt: Date
}

export interface PostInput {
  title: string
  content: string
  tags: string[]
  status: PostStatus
}
