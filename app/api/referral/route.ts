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
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const docRef = db.collection("referrals").doc(email)
    const doc = await docRef.get()

    if (doc.exists) {
      const data = doc.data()
      return NextResponse.json({ referralCode: data?.referralCode, count: data?.count || 0 })
    } else {
      return NextResponse.json({ referralCode: null, count: 0 })
    }
  } catch (error) {
    console.error("Error fetching referral data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
