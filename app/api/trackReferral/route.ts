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

export async function POST(req: Request) {
  try {
    const { referrerCode, referredEmail } = await req.json()

    if (!referrerCode || !referredEmail) {
      return NextResponse.json({ error: "Referrer code and referred email are required" }, { status: 400 })
    }

    // Check if the referrer code exists
    const referrerDocRef = db.collection("referrals").doc(referrerCode)
    const referrerDoc = await referrerDocRef.get()

    if (!referrerDoc.exists) {
      return NextResponse.json({ error: "Invalid referrer code" }, { status: 404 })
    }

    // Add the referred user to a subcollection under the referrer
    await referrerDocRef.collection("referredUsers").add({
      email: referredEmail,
      timestamp: new Date(),
    })

    return NextResponse.json({ message: "Referral tracked successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
