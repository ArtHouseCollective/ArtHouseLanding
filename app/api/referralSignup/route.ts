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
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Generate a simple referral code (e.g., first part of email + random string)
    const emailPrefix = email.split("@")[0]
    const referralCode = `${emailPrefix}-${Math.random().toString(36).substring(2, 8)}`

    // Store the new user and their referral code
    await db.collection("referrals").doc(referralCode).set({
      email,
      createdAt: new Date(),
    })

    return NextResponse.json({ referralCode }, { status: 200 })
  } catch (error) {
    console.error("Error signing up for referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
