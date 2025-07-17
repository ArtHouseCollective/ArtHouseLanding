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

export async function POST(request: Request) {
  const { referrerEmail, referredEmail } = await request.json()

  if (!referrerEmail || !referredEmail) {
    return NextResponse.json({ error: "Referrer and referred emails are required" }, { status: 400 })
  }

  try {
    const referrerRef = db.collection("users").doc(referrerEmail)
    await referrerRef.update({
      referralCount: getFirestore.FieldValue.increment(1),
    })

    // Optionally, mark the referred user as having been referred
    const referredUserRef = db.collection("users").doc(referredEmail)
    await referredUserRef.set({ referredBy: referrerEmail }, { merge: true })

    return NextResponse.json({ message: "Referral tracked successfully!" })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
