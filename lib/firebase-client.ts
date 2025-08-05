import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate required Firebase config
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]

const missingVars = requiredEnvVars.filter((varName) => {
  const value = process.env[varName]
  return !value || value.trim() === ""
})

// Only log warning instead of throwing error to prevent white screen
if (missingVars.length > 0) {
  console.warn("Missing Firebase environment variables:", missingVars)
  console.warn("Firebase features will be disabled until environment variables are configured")
}

// Initialize Firebase only if we have the required config
let app: any = null
let auth: any = null
let db: any = null

try {
  if (missingVars.length === 0) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
  } else {
    // Create mock objects to prevent crashes
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured")),
      signOut: () => Promise.reject(new Error("Firebase not configured")),
    }
    db = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.reject(new Error("Firebase not configured")),
          set: () => Promise.reject(new Error("Firebase not configured")),
        }),
      }),
    }
  }
} catch (error) {
  console.warn("Firebase initialization failed:", error)
  // Create mock objects to prevent crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured")),
    signOut: () => Promise.reject(new Error("Firebase not configured")),
  }
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error("Firebase not configured")),
        set: () => Promise.reject(new Error("Firebase not configured")),
      }),
    }),
  }
}

export { auth, db }
export default app
