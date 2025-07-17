import { NextResponse } from "next/server"
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const userRef = db.collection("users").doc(email)
    const doc = await userRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = doc.data()
    return NextResponse.json({ referralCode: userData?.referralCode, referralCount: userData?.referralCount || 0 })
  } catch (error) {
    console.error("Error fetching referral data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { email, referralCode } = await req.json()

    if (!email || !referralCode) {
      return NextResponse.json({ error: "Email and referral code are required" }, { status: 400 })
    }

    // Check if the referral code exists and is valid
    const referrerDoc = await db.collection("referrals").doc(referralCode).get()

    if (!referrerDoc.exists) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    // Add the new referral to the 'referrals' subcollection of the referrer
    await db.collection("referrals").doc(referralCode).collection("referredUsers").add({
      email,
      timestamp: new Date(),
    })

    return NextResponse.json({ message: "Referral recorded successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error recording referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
