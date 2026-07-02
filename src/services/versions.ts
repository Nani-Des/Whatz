import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import type { PostVersion } from '../types/post'
import { getFirestoreErrorMessage } from '../utils/firestoreError'

function mapVersion(id: string, data: Record<string, unknown>): PostVersion {
  const createdAt = data.createdAt as Timestamp | undefined
  return {
    id,
    postId: (data.postId as string) ?? '',
    title: (data.title as string) ?? '',
    content: (data.content as string) ?? '',
    excerpt: (data.excerpt as string) ?? '',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    createdAt: createdAt?.toDate?.() ?? new Date(),
  }
}

export async function savePostVersion(
  postId: string,
  snapshot: { title: string; content: string; excerpt: string; tags: string[] },
): Promise<void> {
  try {
    const versionsRef = collection(db, 'posts', postId, 'versions')
    await addDoc(versionsRef, {
      postId,
      ...snapshot,
      createdAt: serverTimestamp(),
    })
    const q = query(versionsRef, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const toDelete = snap.docs.slice(20)
    await Promise.all(toDelete.map((d) => deleteDoc(d.ref)))
  } catch (error) {
    console.warn('Version history unavailable:', getFirestoreErrorMessage(error))
  }
}

export async function getPostVersions(postId: string): Promise<PostVersion[]> {
  try {
    const q = query(
      collection(db, 'posts', postId, 'versions'),
      orderBy('createdAt', 'desc'),
      limit(20),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => mapVersion(d.id, d.data()))
  } catch {
    const snapshot = await getDocs(collection(db, 'posts', postId, 'versions'))
    return snapshot.docs
      .map((d) => mapVersion(d.id, d.data()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20)
  }
}
