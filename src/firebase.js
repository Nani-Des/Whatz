import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBdnYYi0kATHwc5oJ32p9yzCzxOpIQxvFA",
  authDomain: "whatz-1a.firebaseapp.com",
  projectId: "whatz-1a",
  storageBucket: "whatz-1a.firebasestorage.app",
  messagingSenderId: "501870253543",
  appId: "1:501870253543:web:4407f4551da57b1dbe1942",
  measurementId: "G-0Y4EE54BF3"
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence unavailable: multiple tabs open')
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser')
  }
})
