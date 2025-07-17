import { type NextRequest, NextResponse } from "next/server"
import { FieldValue, getApps, initializeApp, cert } from "firebase-admin/app"
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getAdminFirestore()

export async function POST(request: NextRequest) {
  try {
    const { referralCode } = await request.json()

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    const referralDoc = await db.collection("referrals").where("referralCode", "==", referralCode).limit(1).get()

    if (referralDoc.empty) {
      return NextResponse.json({ error: "Referral code not found" }, { status: 404 })
    }

    const docRef = referralDoc.docs[0].ref
    await docRef.update({
      clicks: FieldValue.increment(1),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Failed to track referral" }, { status: 500 })
  }
}
