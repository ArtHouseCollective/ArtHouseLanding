import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Debug environment variables (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("🔥 Firebase env vars check:", {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ FOUND" : "❌ MISSING",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ FOUND" : "❌ MISSING",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ FOUND" : "❌ MISSING",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ FOUND" : "❌ MISSING",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✅ FOUND" : "❌ MISSING",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ FOUND" : "❌ MISSING",
  })
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

export const isFirebaseConfigured = missingVars.length === 0

// Only show warnings in development
if (!isFirebaseConfigured && process.env.NODE_ENV === "development") {
  console.warn("🔥 Firebase not configured - missing environment variables:", missingVars)
  console.warn("🔧 Add these environment variables to your Vercel deployment:")
  missingVars.forEach((varName) => {
    console.warn(`   ${varName}=your_value_here`)
  })
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
}

// Create comprehensive mock objects for when Firebase is not configured
const createMockAuth = (): Auth => {
  return {
    currentUser: null,
    onAuthStateChanged: (callback: (user: any) => void) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Mock Firebase: onAuthStateChanged called")
      }
      // Call callback immediately with null user
      setTimeout(() => callback(null), 100)
      return () => {} // unsubscribe function
    },
    signInWithEmailAndPassword: (email: string, password: string) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Mock Firebase: signInWithEmailAndPassword called")
      }
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
    createUserWithEmailAndPassword: (email: string, password: string) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Mock Firebase: createUserWithEmailAndPassword called")
      }
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
    signOut: () => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Mock Firebase: signOut called")
      }
      return Promise.resolve()
    },
    sendPasswordResetEmail: (email: string) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Mock Firebase: sendPasswordResetEmail called")
      }
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
    updateProfile: () => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Mock Firebase: updateProfile called")
      }
      return Promise.reject(new Error("Firebase not configured - please add environment variables"))
    },
  } as any
}

const createMockFirestore = (): Firestore =>
  ({
    collection: (path: string) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Mock Firestore: collection called with path:", path)
      }
      return {
        doc: (id?: string) => ({
          get: () => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔥 Mock Firestore: doc.get called")
            }
            return Promise.reject(new Error("Firebase not configured - please add environment variables"))
          },
          set: (data: any) => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔥 Mock Firestore: doc.set called")
            }
            return Promise.reject(new Error("Firebase not configured - please add environment variables"))
          },
          update: (data: any) => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔥 Mock Firestore: doc.update called")
            }
            return Promise.reject(new Error("Firebase not configured - please add environment variables"))
          },
          delete: () => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔥 Mock Firestore: doc.delete called")
            }
            return Promise.reject(new Error("Firebase not configured - please add environment variables"))
          },
          onSnapshot: (callback: any) => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔥 Mock Firestore: doc.onSnapshot called")
            }
            return () => {} // unsubscribe function
          },
        }),
        add: (data: any) => {
          if (process.env.NODE_ENV === "development") {
            console.log("🔥 Mock Firestore: collection.add called")
          }
          return Promise.reject(new Error("Firebase not configured - please add environment variables"))
        },
        where: (field: string, operator: any, value: any) => ({
          get: () => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔥 Mock Firestore: where.get called")
            }
            return Promise.reject(new Error("Firebase not configured - please add environment variables"))
          },
          onSnapshot: (callback: any) => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔥 Mock Firestore: where.onSnapshot called")
            }
            return () => {}
          },
        }),
        orderBy: (field: string, direction?: "asc" | "desc") => ({
          get: () => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔥 Mock Firestore: orderBy.get called")
            }
            return Promise.reject(new Error("Firebase not configured - please add environment variables"))
          },
          limit: (limitCount: number) => ({
            get: () => {
              if (process.env.NODE_ENV === "development") {
                console.log("🔥 Mock Firestore: orderBy.limit.get called")
              }
              return Promise.reject(new Error("Firebase not configured - please add environment variables"))
            },
          }),
        }),
        get: () => {
          if (process.env.NODE_ENV === "development") {
            console.log("🔥 Mock Firestore: collection.get called")
          }
          return Promise.reject(new Error("Firebase not configured - please add environment variables"))
        },
      }
    },
  }) as any

// Initialize Firebase only if we have the required config
let app: FirebaseApp | null = null
let auth: Auth
let db: Firestore

try {
  if (isFirebaseConfigured) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔥 Initializing Firebase with real config...")
    }

    // Initialize Firebase app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

    // Initialize Auth and Firestore with the app instance
    auth = getAuth(app)
    db = getFirestore(app)

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Firebase initialized successfully")
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      console.log("🔥 Using mock Firebase objects...")
    }
    auth = createMockAuth()
    db = createMockFirestore()
  }
} catch (error) {
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Firebase initialization failed:", error)
    console.log("🔥 Falling back to mock Firebase objects...")
  }
  auth = createMockAuth()
  db = createMockFirestore()
}

export { auth, db }
export default app
