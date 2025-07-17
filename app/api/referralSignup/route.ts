import { type NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initializeFirebaseAdmin } from "@/lib/firebase-admin"
import { generateReferralCode } from "@/lib/referral"

initializeFirebaseAdmin()

export async function POST(req: NextRequest) {
  const { email, referralCode: incomingReferralCode } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const db = getFirestore()

    // Check if user already exists
    const userDoc = await db.collection("users").doc(email).get()
    if (userDoc.exists) {
      return NextResponse.json({ message: "User already signed up" }, { status: 200 })
    }

    // Generate a new referral code for the new user
    const newReferralCode = generateReferralCode()

    // Create new user entry
    await db
      .collection("users")
      .doc(email)
      .set({
        email,
        referralCode: newReferralCode,
        signedUpAt: new Date().toISOString(),
        invitedBy: incomingReferralCode || null,
      })

    // Increment signups for the incoming referral code, if present
    if (incomingReferralCode) {
      const referralRef = db.collection("referrals").doc(incomingReferralCode)
      await referralRef.update({
        signups: getFirestore.FieldValue.increment(1),
      })
    }

    // Increment total founders circle filled spots
    const statsRef = db.collection("stats").doc("foundersCircle")
    await statsRef.update({
      filled: getFirestore.FieldValue.increment(1),
    })

    return NextResponse.json({
      message: "Successfully signed up and generated referral code",
      referralCode: newReferralCode,
    })
  } catch (error) {
    console.error("Error during referral signup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
