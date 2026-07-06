import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import type { Post, PostInput, PostReference, PostStatus } from '../types/post'
import { cleanFirestoreData } from '../utils/cleanFirestoreData'
import { getFirestoreErrorMessage } from '../utils/firestoreError'
import { slugify, uniqueSlug } from '../utils/slug'
import { mapPostAnimation } from '../types/postAnimation'

const postsCollection = collection(db, 'posts')

function timestampToDate(value: Timestamp | undefined | null): Date | null {
  if (value && typeof value.toDate === 'function') return value.toDate()
  return null
}

function mapReferences(raw: unknown): PostReference[] {
  if (!Array.isArray(raw)) return []
  return raw.map((r) => {
    const ref = r as PostReference
    const type = ref.type === 'upload' ? 'upload' : ref.type === 'post' ? 'post' : 'link'
    const slug = ref.slug ?? ''
    return {
      id: ref.id ?? crypto.randomUUID(),
      type,
      title: ref.title ?? '',
      url: type === 'post' && slug ? `/post/s/${slug}` : (ref.url ?? ''),
      fileName: ref.fileName,
      mimeType: ref.mimeType,
      postId: ref.postId,
      slug: ref.slug,
    }
  })
}

function mapDoc(id: string, data: Record<string, unknown>): Post {
  const scheduled = timestampToDate(data.scheduledPublishAt as Timestamp | undefined)
  return {
    id,
    slug: (data.slug as string) ?? id,
    title: (data.title as string) ?? '',
    content: (data.content as string) ?? '',
    excerpt: (data.excerpt as string) ?? '',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    type: (data.type as Post['type']) === 'project' ? 'project' : 'article',
    status: (['draft', 'published', 'scheduled'] as const).includes(data.status as PostStatus)
      ? (data.status as PostStatus)
      : 'draft',
    pinned: Boolean(data.pinned),
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
    coverImageUrl: (data.coverImageUrl as string) ?? '',
    seoTitle: (data.seoTitle as string) ?? '',
    seoDescription: (data.seoDescription as string) ?? '',
    ogImageUrl: (data.ogImageUrl as string) ?? '',
    references: mapReferences(data.references),
    projectDemoUrl: (data.projectDemoUrl as string) ?? '',
    projectRepoUrl: (data.projectRepoUrl as string) ?? '',
    projectTechStack: Array.isArray(data.projectTechStack) ? (data.projectTechStack as string[]) : [],
    scheduledPublishAt: scheduled,
    animation: mapPostAnimation(data.animation),
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined) ?? new Date(0),
    updatedAt: timestampToDate(data.updatedAt as Timestamp | undefined) ?? new Date(0),
  }
}

function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    const aTime = a.updatedAt.getTime() || a.createdAt.getTime()
    const bTime = b.updatedAt.getTime() || b.createdAt.getTime()
    return bTime - aTime
  })
}

function buildPostPayload(data: Partial<PostInput>, existingSlugs: string[] = []): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (data.title !== undefined) payload.title = data.title
  if (data.content !== undefined) payload.content = data.content
  if (data.excerpt !== undefined) payload.excerpt = data.excerpt
  if (data.tags !== undefined) payload.tags = data.tags
  if (data.type !== undefined) payload.type = data.type
  if (data.status !== undefined) payload.status = data.status
  if (data.pinned !== undefined) payload.pinned = data.pinned
  if (data.coverImageUrl !== undefined) payload.coverImageUrl = data.coverImageUrl
  if (data.seoTitle !== undefined) payload.seoTitle = data.seoTitle
  if (data.seoDescription !== undefined) payload.seoDescription = data.seoDescription
  if (data.ogImageUrl !== undefined) payload.ogImageUrl = data.ogImageUrl
  if (data.references !== undefined) payload.references = data.references
  if (data.projectDemoUrl !== undefined) payload.projectDemoUrl = data.projectDemoUrl
  if (data.projectRepoUrl !== undefined) payload.projectRepoUrl = data.projectRepoUrl
  if (data.projectTechStack !== undefined) payload.projectTechStack = data.projectTechStack
  if (data.scheduledPublishAt !== undefined) payload.scheduledPublishAt = data.scheduledPublishAt
  if (data.animation !== undefined) payload.animation = data.animation

  if (data.slug !== undefined) {
    payload.slug = slugify(data.slug)
  } else if (data.title !== undefined) {
    payload.slug = uniqueSlug(data.title, existingSlugs)
  }

  return payload
}

async function fetchAllPosts(): Promise<Post[]> {
  const snapshot = await getDocs(postsCollection)
  return sortPosts(snapshot.docs.map((d) => mapDoc(d.id, d.data())))
}

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    await publishDueScheduledPosts()
    const q = query(postsCollection, where('status', '==', 'published'))
    const snapshot = await getDocs(q)
    return sortPosts(snapshot.docs.map((d) => mapDoc(d.id, d.data())))
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    await publishDueScheduledPosts()
    return await fetchAllPosts()
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const snapshot = await getDoc(doc(db, 'posts', id))
    if (!snapshot.exists()) return null
    return mapDoc(snapshot.id, snapshot.data())
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = query(postsCollection, where('slug', '==', slug))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const docSnap = snapshot.docs[0]
    return mapDoc(docSnap.id, docSnap.data())
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function createPost(data: PostInput): Promise<string> {
  try {
    const all = await fetchAllPosts()
    const slugs = all.map((p) => p.slug)
    const payload = buildPostPayload(data, slugs)
    const docRef = await addDoc(
      postsCollection,
      cleanFirestoreData({
        title: data.title ?? '',
        content: data.content ?? '',
        excerpt: data.excerpt ?? '',
        tags: data.tags ?? [],
        type: data.type ?? 'article',
        status: data.status ?? 'draft',
        pinned: data.pinned ?? false,
        coverImageUrl: data.coverImageUrl ?? '',
        seoTitle: data.seoTitle ?? '',
        seoDescription: data.seoDescription ?? '',
        ogImageUrl: data.ogImageUrl ?? '',
        references: data.references ?? [],
        projectDemoUrl: data.projectDemoUrl ?? '',
        projectRepoUrl: data.projectRepoUrl ?? '',
        projectTechStack: data.projectTechStack ?? [],
        scheduledPublishAt: data.scheduledPublishAt ?? null,
        animation: data.animation ?? mapPostAnimation(undefined),
        slug: payload.slug ?? uniqueSlug(data.title || 'untitled', slugs),
        viewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
    return docRef.id
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function updatePost(id: string, data: Partial<PostInput>): Promise<void> {
  try {
    let payload = { ...data }
    if (data.title && !data.slug) {
      const all = await fetchAllPosts()
      const slugs = all.filter((p) => p.id !== id).map((p) => p.slug)
      payload = { ...payload, slug: uniqueSlug(data.title, slugs) }
    }
    if (data.slug) {
      payload = { ...payload, slug: slugify(data.slug) }
    }
    await updateDoc(
      doc(db, 'posts', id),
      cleanFirestoreData({
        ...buildPostPayload(payload),
        updatedAt: serverTimestamp(),
      }),
    )
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', id))
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function togglePublish(id: string, currentStatus: PostStatus): Promise<void> {
  const newStatus: PostStatus = currentStatus === 'published' ? 'draft' : 'published'
  await updatePost(id, { status: newStatus, scheduledPublishAt: null })
}

export async function incrementPostView(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'posts', id), { viewCount: increment(1) })
  } catch {
    // non-blocking
  }
}

export async function publishDueScheduledPosts(): Promise<number> {
  try {
    const q = query(postsCollection, where('status', '==', 'scheduled'))
    const snapshot = await getDocs(q)
    const now = Date.now()
    let count = 0
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const scheduled = timestampToDate(data.scheduledPublishAt as Timestamp | undefined)
      if (scheduled && scheduled.getTime() <= now) {
        await updateDoc(docSnap.ref, {
          status: 'published',
          scheduledPublishAt: null,
          updatedAt: serverTimestamp(),
        })
        count++
      }
    }
    return count
  } catch {
    return 0
  }
}

export async function togglePin(id: string, pinned: boolean): Promise<void> {
  await updatePost(id, { pinned: !pinned })
}
