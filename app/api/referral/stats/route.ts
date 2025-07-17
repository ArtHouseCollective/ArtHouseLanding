import { type NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, cert, getApps } from "firebase-admin/app"

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

const db = getFirestore()

export async function GET(req: NextRequest) {
  try {
    const snapshot = await db.collection("referrals").get()
    let totalReferrals = 0
    snapshot.forEach((doc) => {
      const data = doc.data()
      totalReferrals += data.count || 0
    })

    return NextResponse.json({ totalReferrals })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
