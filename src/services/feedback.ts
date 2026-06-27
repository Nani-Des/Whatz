import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import type { Feedback, FeedbackInput } from '../types/feedback'
import { cleanFirestoreData } from '../utils/cleanFirestoreData'
import { getFirestoreErrorMessage } from '../utils/firestoreError'

const feedbackCollection = collection(db, 'feedback')

function mapFeedback(id: string, data: Record<string, unknown>): Feedback {
  const createdAt = data.createdAt as Timestamp | undefined
  return {
    id,
    postId: (data.postId as string) ?? '',
    postTitle: (data.postTitle as string) ?? '',
    name: (data.name as string) ?? 'Anonymous',
    email: (data.email as string) ?? '',
    message: (data.message as string) ?? '',
    createdAt: createdAt?.toDate?.() ?? new Date(),
  }
}

export async function submitFeedback(input: FeedbackInput): Promise<void> {
  try {
    await addDoc(
      feedbackCollection,
      cleanFirestoreData({
        postId: input.postId,
        postTitle: input.postTitle,
        name: input.name.trim() || 'Anonymous',
        email: input.email.trim(),
        message: input.message.trim(),
        createdAt: serverTimestamp(),
      }),
    )
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function getAllFeedback(): Promise<Feedback[]> {
  try {
    const q = query(feedbackCollection, orderBy('createdAt', 'desc'), limit(100))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => mapFeedback(d.id, d.data()))
  } catch {
    try {
      const snapshot = await getDocs(feedbackCollection)
      return snapshot.docs
        .map((d) => mapFeedback(d.id, d.data()))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      throw new Error(getFirestoreErrorMessage(error))
    }
  }
}

export async function deleteFeedback(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'feedback', id))
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}
