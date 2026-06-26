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
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import type { Post, PostInput, PostStatus } from '../types/post'

const postsCollection = collection(db, 'posts')

function timestampToDate(value: Timestamp | undefined): Date {
  return value?.toDate() ?? new Date()
}

function mapDoc(id: string, data: Record<string, unknown>): Post {
  return {
    id,
    title: (data.title as string) ?? '',
    content: (data.content as string) ?? '',
    tags: (data.tags as string[]) ?? [],
    status: (data.status as PostStatus) ?? 'draft',
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined),
    updatedAt: timestampToDate(data.updatedAt as Timestamp | undefined),
  }
}

export async function getPublishedPosts(): Promise<Post[]> {
  const q = query(
    postsCollection,
    where('status', '==', 'published'),
    orderBy('updatedAt', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => mapDoc(d.id, d.data()))
}

export async function getAllPosts(): Promise<Post[]> {
  const q = query(postsCollection, orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => mapDoc(d.id, d.data()))
}

export async function getPost(id: string): Promise<Post | null> {
  const snapshot = await getDoc(doc(db, 'posts', id))
  if (!snapshot.exists()) return null
  return mapDoc(snapshot.id, snapshot.data())
}

export async function createPost(data: PostInput): Promise<string> {
  const docRef = await addDoc(postsCollection, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updatePost(id: string, data: Partial<PostInput>): Promise<void> {
  await updateDoc(doc(db, 'posts', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', id))
}

export async function togglePublish(id: string, currentStatus: PostStatus): Promise<void> {
  const newStatus: PostStatus = currentStatus === 'published' ? 'draft' : 'published'
  await updatePost(id, { status: newStatus })
}
