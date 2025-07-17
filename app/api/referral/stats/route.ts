import { NextResponse } from "next/server"
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const referralCode = url.searchParams.get("code")

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    const referrerDoc = await db.collection("referrals").doc(referralCode).get()

    if (!referrerDoc.exists) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    const referredUsersSnapshot = await db.collection("referrals").doc(referralCode).collection("referredUsers").get()

    const referralCount = referredUsersSnapshot.size

    return NextResponse.json({ referralCount }, { status: 200 })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
