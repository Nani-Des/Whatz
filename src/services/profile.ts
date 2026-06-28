import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import { DEFAULT_PROFILE, type Profile, type ProfileInput } from '../types/profile'
import { cleanFirestoreData } from '../utils/cleanFirestoreData'
import { getFirestoreErrorMessage } from '../utils/firestoreError'

const profileRef = doc(db, 'site', 'profile')

function mapProfile(data: Record<string, unknown>): Profile {
  const updatedAt = data.updatedAt as Timestamp | undefined
  return {
    name: (data.name as string) ?? DEFAULT_PROFILE.name,
    headline: (data.headline as string) ?? DEFAULT_PROFILE.headline,
    bio: (data.bio as string) ?? DEFAULT_PROFILE.bio,
    avatarUrl: (data.avatarUrl as string) ?? '',
    location: (data.location as string) ?? '',
    linkedin: (data.linkedin as string) ?? '',
    github: (data.github as string) ?? '',
    email: (data.email as string) ?? DEFAULT_PROFILE.email,
    googleScholar: (data.googleScholar as string) ?? '',
    username: (data.username as string) ?? DEFAULT_PROFILE.username,
    contactCtaText: (data.contactCtaText as string) ?? DEFAULT_PROFILE.contactCtaText,
    showContactCta: data.showContactCta !== false,
    updatedAt: updatedAt?.toDate?.() ?? new Date(),
  }
}

export async function getProfile(): Promise<Profile> {
  try {
    const snapshot = await getDoc(profileRef)
    if (!snapshot.exists()) return { ...DEFAULT_PROFILE, updatedAt: new Date() }
    return mapProfile(snapshot.data())
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function updateProfile(data: ProfileInput): Promise<void> {
  try {
    await setDoc(
      profileRef,
      cleanFirestoreData({
        ...data,
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    )
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error))
  }
}

export async function ensureProfile(): Promise<void> {
  try {
    const snapshot = await getDoc(profileRef)
    if (!snapshot.exists()) {
      await setDoc(profileRef, {
        ...DEFAULT_PROFILE,
        updatedAt: serverTimestamp(),
      })
    }
  } catch {
    // Admin can create manually
  }
}
