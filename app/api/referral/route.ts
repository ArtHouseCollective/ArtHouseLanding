import { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } from "@/lib/constants"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { NextResponse } from "next/server"
import { getReferralStats } from "@/lib/referral"

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Handle private key newlines
    }),
  })
}

const db = getFirestore()

export async function POST(req: Request) {
  try {
    const { referralCode } = await req.json()

    if (!referralCode) {
      return new Response(JSON.stringify({ error: "Referral code is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const referralRef = db.collection("referrals").doc(referralCode)
    const doc = await referralRef.get()

    if (doc.exists) {
      // Increment signup count
      await referralRef.update({
        signups: (doc.data()?.signups || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
    } else {
      // Create new referral entry
      await referralRef.set({
        code: referralCode,
        signups: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    // Also increment a global counter for Founders Circle spots
    const statsRef = db.collection("referralStats").doc("current")
    await db.runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(statsRef)
      if (statsDoc.exists) {
        const currentSignups = statsDoc.data()?.signups || 0
        transaction.update(statsRef, { signups: currentSignups + 1 })
      } else {
        transaction.set(statsRef, { signups: 1 })
      }
    })

    return new Response(JSON.stringify({ message: "Referral tracked successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const referralCode = searchParams.get("code")

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    const stats = await getReferralStats(referralCode)

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
