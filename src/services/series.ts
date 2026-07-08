import {
  collection,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import type { Series, SeriesInput, SeriesStatus } from '../types/series'
import { cleanFirestoreData } from '../utils/cleanFirestoreData'
import { getFirestoreErrorMessage } from '../utils/firestoreError'
import { slugify, uniqueSlug } from '../utils/slug'

const seriesCollection = collection(db, 'series')
const legacyCollection = collection(db, 'projects')

function timestampToDate(value: Timestamp | undefined | null): Date | null {
  if (value && typeof value.toDate === 'function') return value.toDate()
  return null
}

function mapSeries(id: string, data: Record<string, unknown>): Series {
  return {
    id,
    slug: (data.slug as string) ?? id,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    excerpt: (data.excerpt as string) ?? '',
    coverImageUrl: (data.coverImageUrl as string) ?? '',
    demoUrl: (data.demoUrl as string) ?? '',
    repoUrl: (data.repoUrl as string) ?? '',
    techStack: Array.isArray(data.techStack) ? (data.techStack as string[]) : [],
    status: (['active', 'complete', 'paused'] as const).includes(data.status as SeriesStatus)
      ? (data.status as SeriesStatus)
      : 'active',
    featured: Boolean(data.featured),
    overviewPostId: (data.overviewPostId as string) || null,
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined) ?? new Date(0),
    updatedAt: timestampToDate(data.updatedAt as Timestamp | undefined) ?? new Date(0),
  }
}

function sortSeries(items: Series[]): Series[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    const statusOrder = { active: 0, complete: 1, paused: 2 }
    const sa = statusOrder[a.status]
    const sb = statusOrder[b.status]
    if (sa !== sb) return sa - sb
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })
}

async function fetchFromCollection(col: ReturnType<typeof collection>): Promise<Series[]> {
  try {
    const snapshot = await getDocsFromServer(col)
    return snapshot.docs.map((d) => mapSeries(d.id, d.data()))
  } catch {
    const snapshot = await getDocs(col)
    return snapshot.docs.map((d) => mapSeries(d.id, d.data()))
  }
}

async function fetchAllSeries(): Promise<Series[]> {
  const primary = await fetchFromCollection(seriesCollection)
  if (primary.length > 0) return sortSeries(primary)
  const legacy = await fetchFromCollection(legacyCollection)
  return sortSeries(legacy)
}

function seriesDocRef(id: string) {
  return doc(db, 'series', id)
}

function buildSeriesPayload(data: Partial<SeriesInput>, existingSlugs: string[] = []): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  if (data.title !== undefined) payload.title = data.title
  if (data.description !== undefined) payload.description = data.description
  if (data.excerpt !== undefined) payload.excerpt = data.excerpt
  if (data.coverImageUrl !== undefined) payload.coverImageUrl = data.coverImageUrl
  if (data.demoUrl !== undefined) payload.demoUrl = data.demoUrl
  if (data.repoUrl !== undefined) payload.repoUrl = data.repoUrl
  if (data.techStack !== undefined) payload.techStack = data.techStack
  if (data.status !== undefined) payload.status = data.status
  if (data.featured !== undefined) payload.featured = data.featured
  if (data.overviewPostId !== undefined) payload.overviewPostId = data.overviewPostId
  if (data.slug !== undefined) {
    payload.slug = slugify(data.slug)
  } else if (data.title !== undefined) {
    payload.slug = uniqueSlug(data.title, existingSlugs)
  }
  return payload
}

async function getSeriesDoc(id: string) {
  let snapshot = await getDoc(seriesDocRef(id))
  if (snapshot.exists()) return snapshot
  snapshot = await getDoc(doc(db, 'projects', id))
  return snapshot.exists() ? snapshot : null
}

export async function getPublishedSeries(): Promise<Series[]> {
  try {
    return (await fetchAllSeries()).filter((s) => s.status !== 'paused')
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function getAllSeries(): Promise<Series[]> {
  try {
    return await fetchAllSeries()
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function getSeries(id: string): Promise<Series | null> {
  try {
    const snapshot = await getSeriesDoc(id)
    if (!snapshot?.exists()) return null
    return mapSeries(snapshot.id, snapshot.data())
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  try {
    let q = query(seriesCollection, where('slug', '==', slug))
    let snapshot = await getDocs(q)
    if (snapshot.empty) {
      q = query(legacyCollection, where('slug', '==', slug))
      snapshot = await getDocs(q)
    }
    if (snapshot.empty) return null
    const docSnap = snapshot.docs[0]
    return mapSeries(docSnap.id, docSnap.data())
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function createSeries(data: SeriesInput): Promise<string> {
  try {
    const all = await fetchAllSeries()
    const slugs = all.map((s) => s.slug)
    const payload = buildSeriesPayload(data, slugs)
    const docRef = await addDoc(
      seriesCollection,
      cleanFirestoreData({
        title: data.title ?? '',
        description: data.description ?? '',
        excerpt: data.excerpt ?? '',
        coverImageUrl: data.coverImageUrl ?? '',
        demoUrl: data.demoUrl ?? '',
        repoUrl: data.repoUrl ?? '',
        techStack: data.techStack ?? [],
        status: data.status ?? 'active',
        featured: data.featured ?? false,
        overviewPostId: data.overviewPostId ?? null,
        slug: payload.slug ?? uniqueSlug(data.title || 'series', slugs),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
    return docRef.id
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function updateSeries(id: string, data: Partial<SeriesInput>): Promise<void> {
  try {
    let payload = { ...data }
    if (data.title && !data.slug) {
      const all = await fetchAllSeries()
      const slugs = all.filter((s) => s.id !== id).map((s) => s.slug)
      payload = { ...payload, slug: uniqueSlug(data.title, slugs) }
    }
    if (data.slug) payload = { ...payload, slug: slugify(data.slug) }

    const ref = seriesDocRef(id)
    const existing = await getDoc(ref)
    const targetRef = existing.exists() ? ref : doc(db, 'projects', id)

    await updateDoc(
      targetRef,
      cleanFirestoreData({
        ...buildSeriesPayload(payload),
        updatedAt: serverTimestamp(),
      }),
    )
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function deleteSeries(id: string): Promise<void> {
  try {
    await deleteDoc(seriesDocRef(id)).catch(() => {})
    await deleteDoc(doc(db, 'projects', id)).catch(() => {})
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export function seriesShareUrl(slug: string): string {
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/series/${slug}`
}
