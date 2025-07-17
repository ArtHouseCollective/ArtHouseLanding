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
    const { email, ref } = await req.json()

    if (!email || !ref) {
      return NextResponse.json({ error: "Missing email or ref" }, { status: 400 })
    }

    // First, validate that the referral code exists in the users collection
    const usersSnapshot = await db.collection("users").where("referralCode", "==", ref).limit(1).get()

    if (usersSnapshot.empty) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }

    // Get the user who owns this referral code
    const referrerDoc = usersSnapshot.docs[0]
    const referrerId = referrerDoc.id
    const referrerData = referrerDoc.data()

    console.log(`Valid referral code ${ref} found for user ${referrerId}`)

    // Save referral record
    await db
      .collection("referrals")
      .doc(email)
      .set({
        referrer: ref,
        referrerId: referrerId, // Store the actual user ID for reference
        referrerEmail: referrerData.email || null, // Store referrer's email if available
        createdAt: new Date(),
      })

    // Increment referrer's count
    const refCountRef = db.collection("referralCounts").doc(ref)
    await refCountRef.set(
      {
        count: FieldValue.increment(1),
        lastReferral: new Date(),
        referrerId: referrerId, // Store the user ID who owns this code
      },
      { merge: true },
    )

    return NextResponse.json({
      success: true,
      message: "Referral tracked successfully",
      referrer: ref,
      referrerId: referrerId,
    })
  } catch (err) {
    console.error("[Referral Error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
