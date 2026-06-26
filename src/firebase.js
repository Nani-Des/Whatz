import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDmRljYc-psePWbCK6Un9xhbSEN8eLqDcI",
  authDomain: "tracegear-f35d2.firebaseapp.com",
  projectId: "tracegear-f35d2",
  storageBucket: "tracegear-f35d2.firebasestorage.app",
  messagingSenderId: "220475721154",
  appId: "1:220475721154:web:eefd535fbdd21640cb025b",
  measurementId: "G-915X8Q57EF"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
