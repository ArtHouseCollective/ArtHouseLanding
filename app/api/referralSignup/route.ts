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
  const { email, referralCode } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const userRef = db.collection("users").doc(email)
    await userRef.set({ email, referralCode, createdAt: new Date() })

    if (referralCode) {
      const referrerRef = db.collection("users").doc(referralCode)
      await referrerRef.update({
        referralCount: getFirestore.FieldValue.increment(1),
      })
    }

    return NextResponse.json({ message: "Signed up successfully!" })
  } catch (error) {
    console.error("Error signing up with referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
