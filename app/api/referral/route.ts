import { type NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

// Initialize Firebase Admin (only once)
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

export async function POST(request: NextRequest) {
  try {
    const { email, referrer } = await request.json()

    if (!email || !referrer) {
      return NextResponse.json({ error: "Email and referrer are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Use a batch write to ensure both operations succeed or fail together
    const batch = db.batch()

    // 1. Save referral data
    const referralRef = db.collection("referrals").doc(email)
    batch.set(referralRef, {
      referrer: referrer,
      createdAt: FieldValue.serverTimestamp(),
      email: email,
    })

    // 2. Increment referral count
    const countRef = db.collection("referralCounts").doc(referrer)
    batch.set(
      countRef,
      {
        count: FieldValue.increment(1),
        lastReferral: FieldValue.serverTimestamp(),
        referrer: referrer,
      },
      { merge: true },
    )

    // Execute the batch
    await batch.commit()

    return NextResponse.json({
      success: true,
      message: "Referral tracked successfully",
    })
  } catch (error) {
    console.error("Referral tracking error:", error)
    return NextResponse.json(
      {
        error: "Failed to track referral",
      },
      { status: 500 },
    )
  }
}
