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
import type { Post, PostInput, PostStatus } from '../types/post'
import { cleanFirestoreData } from '../utils/cleanFirestoreData'
import { getFirestoreErrorMessage } from '../utils/firestoreError'

const postsCollection = collection(db, 'posts')

function timestampToDate(value: Timestamp | undefined | null): Date {
  if (value && typeof value.toDate === 'function') return value.toDate()
  return new Date(0)
}

function mapDoc(id: string, data: Record<string, unknown>): Post {
  return {
    id,
    title: (data.title as string) ?? '',
    content: (data.content as string) ?? '',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    status: (data.status as PostStatus) ?? 'draft',
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined),
    updatedAt: timestampToDate(data.updatedAt as Timestamp | undefined),
  }
}

function sortByUpdated(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const aTime = a.updatedAt.getTime() || a.createdAt.getTime()
    const bTime = b.updatedAt.getTime() || b.createdAt.getTime()
    return bTime - aTime
  })
}

async function fetchAllPosts(): Promise<Post[]> {
  const snapshot = await getDocs(postsCollection)
  return sortByUpdated(snapshot.docs.map((d) => mapDoc(d.id, d.data())))
}

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const q = query(postsCollection, where('status', '==', 'published'))
    const snapshot = await getDocs(q)
    return sortByUpdated(snapshot.docs.map((d) => mapDoc(d.id, d.data())))
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
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

export async function createPost(data: PostInput): Promise<string> {
  try {
    const docRef = await addDoc(
      postsCollection,
      cleanFirestoreData({
        title: data.title ?? '',
        content: data.content ?? '',
        tags: data.tags ?? [],
        status: data.status ?? 'draft',
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
    await updateDoc(
      doc(db, 'posts', id),
      cleanFirestoreData({
        ...data,
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
  await updatePost(id, { status: newStatus })
}

export async function incrementPostView(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'posts', id), {
      viewCount: increment(1),
    })
  } catch {
    // Non-blocking — analytics still recorded separately
  }
}
