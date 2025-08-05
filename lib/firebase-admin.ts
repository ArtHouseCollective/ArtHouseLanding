import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
}

// Initialize the app if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

// Export the Firestore database and Auth instances
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
