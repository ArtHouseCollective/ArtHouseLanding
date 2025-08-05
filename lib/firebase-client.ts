import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Debug environment variables
console.log("Firebase env vars check:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ FOUND" : "❌ MISSING",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ FOUND" : "❌ MISSING",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ FOUND" : "❌ MISSING",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ FOUND" : "❌ MISSING",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✅ FOUND" : "❌ MISSING",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ FOUND" : "❌ MISSING",
})

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
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

const isFirebaseConfigured = missingVars.length === 0

if (!isFirebaseConfigured) {
  console.warn("🔥 Firebase not configured - missing environment variables:", missingVars)
  console.warn("🔧 Add these environment variables to your Vercel deployment:")
  missingVars.forEach((varName) => {
    console.warn(`   ${varName}=your_value_here`)
  })
}

// Create comprehensive mock objects for when Firebase is not configured
const createMockAuth = () => {
  const mockUser = null

  return {
    currentUser: mockUser,
    onAuthStateChanged: (callback: (user: any) => void) => {
      console.log("🔥 Mock Firebase: onAuthStateChanged called")
      // Call callback immediately with null user
      setTimeout(() => callback(null), 100)
      return () => {} // unsubscribe function
    },
    signInWithEmailAndPassword: (email: string, password: string) => {
      console.log("🔥 Mock Firebase: signInWithEmailAndPassword called")
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
    createUserWithEmailAndPassword: (email: string, password: string) => {
      console.log("🔥 Mock Firebase: createUserWithEmailAndPassword called")
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
    signOut: () => {
      console.log("🔥 Mock Firebase: signOut called")
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
    sendPasswordResetEmail: (email: string) => {
      console.log("🔥 Mock Firebase: sendPasswordResetEmail called")
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
    updateProfile: () => {
      console.log("🔥 Mock Firebase: updateProfile called")
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
  }
}

const createMockFirestore = () => ({
  collection: (path: string) => {
    console.log("🔥 Mock Firestore: collection called with path:", path)
    return {
      doc: (id?: string) => ({
        get: () => {
          console.log("🔥 Mock Firestore: doc.get called")
          return Promise.reject(new Error("Firebase not configured - please add environment variables"))
        },
        set: (data: any) => {
          console.log("🔥 Mock Firestore: doc.set called")
          return Promise.reject(new Error("Firebase not configured - please add environment variables"))
        },
        update: (data: any) => {
          console.log("🔥 Mock Firestore: doc.update called")
          return Promise.reject(new Error("Firebase not configured - please add environment variables"))
        },
        delete: () => {
          console.log("🔥 Mock Firestore: doc.delete called")
          return Promise.reject(new Error("Firebase not configured - please add environment variables"))
        },
        onSnapshot: (callback: any) => {
          console.log("🔥 Mock Firestore: doc.onSnapshot called")
          return () => {} // unsubscribe function
        },
      }),
      add: (data: any) => {
        console.log("🔥 Mock Firestore: collection.add called")
        return Promise.reject(new Error("Firebase not configured - please add environment variables"))
      },
      where: (field: string, operator: any, value: any) => ({
        get: () => {
          console.log("🔥 Mock Firestore: where.get called")
          return Promise.reject(new Error("Firebase not configured - please add environment variables"))
        },
        onSnapshot: (callback: any) => {
          console.log("🔥 Mock Firestore: where.onSnapshot called")
          return () => {}
        },
      }),
      orderBy: (field: string, direction?: "asc" | "desc") => ({
        get: () => {
          console.log("🔥 Mock Firestore: orderBy.get called")
          return Promise.reject(new Error("Firebase not configured - please add environment variables"))
        },
        limit: (limitCount: number) => ({
          get: () => {
            console.log("🔥 Mock Firestore: orderBy.limit.get called")
            return Promise.reject(new Error("Firebase not configured - please add environment variables"))
          },
        }),
      }),
      get: () => {
        console.log("🔥 Mock Firestore: collection.get called")
        return Promise.reject(new Error("Firebase not configured - please add environment variables"))
      },
    }
  },
})

// Initialize Firebase only if we have the required config
let app: any = null
let auth: any = null
let db: any = null

try {
  if (isFirebaseConfigured) {
    console.log("🔥 Initializing Firebase with real config...")
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    console.log("✅ Firebase initialized successfully")
  } else {
    console.log("🔥 Using mock Firebase objects...")
    auth = createMockAuth()
    db = createMockFirestore()
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error)
  console.log("🔥 Falling back to mock Firebase objects...")
  auth = createMockAuth()
  db = createMockFirestore()
}

export { auth, db, isFirebaseConfigured }
export default app
