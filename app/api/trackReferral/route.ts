import { type NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initializeFirebaseAdmin } from "@/lib/firebase-admin"

initializeFirebaseAdmin()

export async function POST(req: NextRequest) {
  const { referralCode } = await req.json()

  if (!referralCode) {
    return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
  }

  try {
    const db = getFirestore()
    const referralRef = db.collection("referrals").doc(referralCode)

    await referralRef.set(
      {
        visits: getFirestore.FieldValue.increment(1),
      },
      { merge: true },
    )

    return NextResponse.json({ message: "Referral tracked successfully" })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
