import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  limit,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import type { VisitRecord, VisitStats } from '../types/analytics'
import { getFirestoreErrorMessage } from '../utils/firestoreError'

const visitsCollection = collection(db, 'visits')

function mapVisit(id: string, data: Record<string, unknown>): VisitRecord {
  const createdAt = data.createdAt as Timestamp | undefined
  return {
    id,
    path: (data.path as string) ?? '/',
    postId: (data.postId as string | null) ?? null,
    createdAt: createdAt?.toDate?.() ?? new Date(),
  }
}

export async function recordVisit(path: string, postId?: string): Promise<void> {
  try {
    await addDoc(visitsCollection, {
      path,
      postId: postId ?? null,
      createdAt: serverTimestamp(),
    })
  } catch {
    // Non-blocking for public pages
  }
}

export async function getVisitStats(): Promise<VisitStats> {
  try {
    let visits: VisitRecord[] = []
    try {
      const q = query(visitsCollection, orderBy('createdAt', 'desc'), limit(500))
      const snapshot = await getDocs(q)
      visits = snapshot.docs.map((d) => mapVisit(d.id, d.data()))
    } catch {
      const snapshot = await getDocs(visitsCollection)
      visits = snapshot.docs
        .map((d) => mapVisit(d.id, d.data()))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 500)
    }

    const visitsByPost: Record<string, number> = {}
    let homeVisits = 0
    let postVisits = 0

    for (const visit of visits) {
      if (visit.path === '/' || visit.path === '') {
        homeVisits++
      }
      if (visit.postId) {
        postVisits++
        visitsByPost[visit.postId] = (visitsByPost[visit.postId] ?? 0) + 1
      }
    }

    const last7Days: { date: string; count: number }[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i)
      const key = day.toISOString().slice(0, 10)
      const count = visits.filter((v) => v.createdAt.toISOString().slice(0, 10) === key).length
      last7Days.push({ date: key, count })
    }

    return {
      totalVisits: visits.length,
      homeVisits,
      postVisits,
      visitsByPost,
      visitsLast7Days: last7Days,
      recentVisits: visits.slice(0, 20),
    }
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}
