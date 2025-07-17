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

export async function POST(req: NextRequest) {
  const { email, referralCode } = await req.json()

  if (!email || !referralCode) {
    return NextResponse.json({ error: "Email and referralCode are required" }, { status: 400 })
  }

  try {
    const docRef = db.collection("referrals").doc(email)
    await docRef.set(
      {
        referralCode: referralCode,
        count: 0, // Initialize count for the new referrer
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return NextResponse.json({ message: "Referral signup successful" })
  } catch (error) {
    console.error("Error during referral signup:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
