import { NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { trackReferralSignup } from "@/lib/referral"

// Initialize Firebase Admin SDK if not already initialized
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

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 })
  }

  try {
    // Check if email already exists in Firestore
    const docRef = db.collection("waitlist").doc(email)
    const doc = await docRef.get()

    if (doc.exists) {
      return NextResponse.json({ message: "Email already on waitlist" }, { status: 200 })
    }

    // Add email to Firestore waitlist
    await docRef.set({
      email,
      timestamp: new Date().toISOString(),
      status: "pending",
    })

    // Optionally, integrate with Beehiiv
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

    if (BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
      const beehiivResponse = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({
            email,
            utm_source: "ArtHouseLandingPage",
            send_welcome_email: true,
            referring_subscriber_id: null, // This would be set if you had a referral system within Beehiiv
          }),
        },
      )

      if (!beehiivResponse.ok) {
        const errorData = await beehiivResponse.json()
        console.error("Beehiiv subscription error:", errorData)
        // Even if Beehiiv fails, we still want to acknowledge the waitlist signup
        return NextResponse.json(
          { message: "Subscribed to waitlist, but Beehiiv integration failed." },
          { status: 200 },
        )
      }
    }

    // Track referral if a code exists in the cookie
    const referralCode = request.cookies.get("referralCode")?.value
    if (referralCode) {
      await trackReferralSignup(email, referralCode)
    }

    return NextResponse.json({ message: "Successfully subscribed to waitlist" }, { status: 200 })
  } catch (error) {
    console.error("Error subscribing:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
