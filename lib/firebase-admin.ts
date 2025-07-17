import { initializeApp, getApps, cert } from "firebase-admin/app"

export function initializeFirebaseAdmin() {
  if (!getApps().length) {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error("Firebase environment variables are not set.")
      return
    }

    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      })
      console.log("Firebase Admin initialized successfully.")
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error)
    }
  }
}
