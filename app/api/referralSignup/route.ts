import type { NextRequest } from "next"
import { NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { trackReferral } from "@/lib/referral"

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
    const { email, referralCode } = await req.json()

    if (!email || !referralCode) {
      return NextResponse.json({ error: "Email and referral code are required" }, { status: 400 })
    }

    await trackReferral(email, referralCode)

    return NextResponse.json({ message: "Referral tracked successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
