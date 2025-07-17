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
  const { referrerEmail } = await req.json()

  if (!referrerEmail) {
    return NextResponse.json({ error: "Referrer email is required" }, { status: 400 })
  }

  try {
    const docRef = db.collection("referrals").doc(referrerEmail)
    const doc = await docRef.get()

    if (doc.exists) {
      await docRef.update({
        count: (doc.data()?.count || 0) + 1,
        lastReferralAt: new Date().toISOString(),
      })
      return NextResponse.json({ message: "Referral count updated" })
    } else {
      // If referrer doesn't exist, create an entry for them with count 1
      await docRef.set(
        {
          referralCode: referrerEmail.split("@")[0], // Simple referral code from email prefix
          count: 1,
          createdAt: new Date().toISOString(),
          lastReferralAt: new Date().toISOString(),
        },
        { merge: true },
      )
      return NextResponse.json({ message: "New referrer created and count updated" })
    }
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
