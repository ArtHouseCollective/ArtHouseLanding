import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

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

export const isFirebaseConfigured = missingVars.length === 0

// Only show warnings in development
if (!isFirebaseConfigured && process.env.NODE_ENV === "development") {
  console.warn("🔥 Firebase not configured - missing environment variables:", missingVars)
}

// Create comprehensive mock objects for when Firebase is not configured
const createMockAuth = (): Auth => {
  return {
    currentUser: null,
    onAuthStateChanged: (callback: (user: any) => void) => {
      setTimeout(() => callback(null), 100)
      return () => {}
    },
    signInWithEmailAndPassword: () => {
      return Promise.reject(new Error("Firebase not configured"))
    },
    createUserWithEmailAndPassword: () => {
      return Promise.reject(new Error("Firebase not configured"))
    },
    signOut: () => {
      return Promise.resolve()
    },
    sendPasswordResetEmail: () => {
      return Promise.reject(new Error("Firebase not configured"))
    },
    updateProfile: () => {
      return Promise.reject(new Error("Firebase not configured"))
    },
  } as any
}

const createMockFirestore = (): Firestore =>
  ({
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error("Firebase not configured")),
        set: () => Promise.reject(new Error("Firebase not configured")),
        update: () => Promise.reject(new Error("Firebase not configured")),
        delete: () => Promise.reject(new Error("Firebase not configured")),
        onSnapshot: () => () => {},
      }),
      add: () => Promise.reject(new Error("Firebase not configured")),
      where: () => ({
        get: () => Promise.reject(new Error("Firebase not configured")),
        onSnapshot: () => () => {},
      }),
      orderBy: () => ({
        get: () => Promise.reject(new Error("Firebase not configured")),
        limit: () => ({
          get: () => Promise.reject(new Error("Firebase not configured")),
        }),
      }),
      get: () => Promise.reject(new Error("Firebase not configured")),
    }),
  }) as any

// Initialize Firebase only if we have the required config
let app: FirebaseApp | null = null
let auth: Auth
let db: Firestore

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase in a way that prevents component registration errors
if (isFirebaseConfigured && isBrowser) {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Firebase app initialized")
      }
    } else {
      app = getApps()[0]
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Using existing Firebase app")
      }
    }

    // Initialize services only after app is ready
    if (app) {
      auth = getAuth(app)
      db = getFirestore(app)

      if (process.env.NODE_ENV === "development") {
        console.log("✅ Firebase services initialized successfully")
      }
    } else {
      throw new Error("Firebase app not initialized")
    }
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error)
    auth = createMockAuth()
    db = createMockFirestore()
  }
} else {
  // Use mock objects when not configured or not in browser
  auth = createMockAuth()
  db = createMockFirestore()

  if (process.env.NODE_ENV === "development" && !isFirebaseConfigured) {
    console.log("🔥 Using mock Firebase objects - environment variables not configured")
  }
}

// Safe initialization wrapper to prevent "auth not registered yet" errors
export const getFirebase = () => {
  if (!isFirebaseConfigured || !isBrowser || !app) {
    throw new Error("Firebase is not properly configured or running in SSR.")
  }
  
  return { app, auth, db }
}

export { auth, db }
export default app
