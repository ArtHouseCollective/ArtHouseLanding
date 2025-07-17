import { type NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const referrer = searchParams.get("referrer")

    if (!referrer) {
      return NextResponse.json({ error: "Referrer parameter is required" }, { status: 400 })
    }

    // Get referral count for specific referrer
    const countDoc = await db.collection("referralCounts").doc(referrer).get()

    if (!countDoc.exists) {
      return NextResponse.json({
        referrer,
        count: 0,
        referrals: [],
      })
    }

    const countData = countDoc.data()

    // Get all referrals made by this referrer
    const referralsSnapshot = await db
      .collection("referrals")
      .where("referrer", "==", referrer)
      .orderBy("createdAt", "desc")
      .get()

    const referrals = referralsSnapshot.docs.map((doc) => ({
      email: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }))

    return NextResponse.json({
      referrer,
      count: countData?.count || 0,
      lastReferral: countData?.lastReferral?.toDate?.()?.toISOString() || null,
      referrals,
    })
  } catch (error) {
    console.error("Stats retrieval error:", error)
    return NextResponse.json(
      {
        error: "Failed to get referral stats",
      },
      { status: 500 },
    )
  }
}
