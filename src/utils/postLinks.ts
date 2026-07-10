import type { Post, PostReference } from '../types/post'

export function postReaderPath(slug: string): string {
  return `/post/s/${encodeURIComponent(slug)}`
}

export function postReaderPathFromPost(post: Pick<Post, 'id' | 'slug'>): string {
  if (post.slug) return postReaderPath(post.slug)
  return `/post/${encodeURIComponent(post.id)}`
}

export function postShareUrl(post: Pick<Post, 'id' | 'slug'>): string {
  const path = postReaderPathFromPost(post)
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}

export function buildPostReference(post: Pick<Post, 'id' | 'title' | 'slug'>): PostReference {
  return {
    id: crypto.randomUUID(),
    type: 'post',
    title: post.title,
    url: postReaderPath(post.slug),
    postId: post.id,
    slug: post.slug,
  }
}

export function isPostReference(ref: PostReference): boolean {
  return ref.type === 'post' && Boolean(ref.slug)
}

export function referenceHref(ref: PostReference): string {
  if (isPostReference(ref) && ref.slug) return postReaderPath(ref.slug)
  return ref.url
}
