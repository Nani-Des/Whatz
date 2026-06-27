import { create } from 'zustand'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase.js'
import { ADMIN_EMAIL } from '../config/admin'

export function isAdminUser(user: User | null): boolean {
  return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  init: () => () => void
}

const googleProvider = new GoogleAuthProvider()

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  signInWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider)
    if (!isAdminUser(result.user)) {
      await signOut(auth)
      throw new Error(`Only ${ADMIN_EMAIL} can access the admin panel.`)
    }
  },

  signOut: async () => {
    await signOut(auth)
  },

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isAdminUser(user)) {
        signOut(auth)
        set({ user: null, loading: false, initialized: true })
        return
      }
      set({ user, loading: false, initialized: true })
    })
    return unsubscribe
  },
}))
