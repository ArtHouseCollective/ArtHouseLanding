import { type NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initializeFirebaseAdmin } from "@/lib/firebase-admin"

initializeFirebaseAdmin()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const referralCode = searchParams.get("code")

  if (!referralCode) {
    return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
  }

  try {
    const db = getFirestore()
    const referralDoc = await db.collection("referrals").doc(referralCode).get()

    if (!referralDoc.exists) {
      return NextResponse.json({ error: "Referral code not found" }, { status: 404 })
    }

    const data = referralDoc.data()
    return NextResponse.json({
      referralCode: referralDoc.id,
      signups: data?.signups || 0,
      invitedBy: data?.invitedBy || null,
    })
  } catch (error) {
    console.error("Error fetching referral data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
