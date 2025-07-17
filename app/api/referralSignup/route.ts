import type { NextRequest } from "next"
import { NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()

export async function POST(req: NextRequest) {
  try {
    const { email, referredBy } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Create the referral user document
    const referralUserData = {
      email: email,
      referredBy: referredBy || null,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    }

    // Save to referralUsers collection
    await db.collection("referralUsers").doc(email).set(referralUserData)

    // If there's a referrer, also update referral tracking
    if (referredBy) {
      // Increment referral count for the referrer
      const referralCountRef = db.collection("referralCounts").doc(referredBy)
      await referralCountRef.set(
        {
          count: FieldValue.increment(1),
          lastReferral: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      console.log(`Referral tracked: ${email} referred by ${referredBy}`)
    }

    return NextResponse.json({
      success: true,
      message: "Referral signup recorded successfully",
      email: email,
      referredBy: referredBy,
    })
  } catch (err) {
    console.error("[Referral Signup Error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
