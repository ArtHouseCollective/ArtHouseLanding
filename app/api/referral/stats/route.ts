import { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } from "@/lib/constants"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Handle private key newlines
    }),
  })
}

const db = getFirestore()

export async function GET() {
  try {
    const statsRef = db.collection("referralStats").doc("current")
    const doc = await statsRef.get()

    if (!doc.exists) {
      return new Response(JSON.stringify({ count: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = doc.data()
    const count = data?.signups || 0

    return new Response(JSON.stringify({ count }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
