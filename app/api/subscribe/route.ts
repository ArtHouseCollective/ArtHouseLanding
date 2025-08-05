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
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    console.log("Processing subscription for:", email)

    // Check if email already exists in Firestore
    const docRef = db.collection("waitlist").doc(email)
    const doc = await docRef.get()

    if (doc.exists) {
      console.log("Email already exists:", email)
      return NextResponse.json({ message: "Email already on waitlist" }, { status: 200 })
    }

    // Add email to Firestore waitlist
    await docRef.set({
      email,
      timestamp: new Date().toISOString(),
      status: "pending",
    })
    console.log("Added to Firestore waitlist:", email)

    // Optionally, integrate with Beehiiv
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

    if (BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
      try {
        console.log("Attempting Beehiiv subscription for:", email)
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
              referring_subscriber_id: null,
            }),
          },
        )

        if (!beehiivResponse.ok) {
          const errorData = await beehiivResponse.json()
          console.error("Beehiiv subscription error:", errorData)
          // Continue even if Beehiiv fails
        } else {
          console.log("Successfully subscribed to Beehiiv:", email)
        }
      } catch (beehiivError) {
        console.error("Beehiiv request failed:", beehiivError)
        // Continue even if Beehiiv fails
      }
    }

    // Track referral if a code exists in the cookie
    const referralCode = request.headers.get("cookie")?.match(/referralCode=([^;]+)/)?.[1]
    if (referralCode) {
      try {
        await trackReferralSignup(email, referralCode)
        console.log("Tracked referral signup:", email, referralCode)
      } catch (referralError) {
        console.error("Referral tracking failed:", referralError)
        // Continue even if referral tracking fails
      }
    }

    return NextResponse.json(
      {
        message: "Successfully subscribed to waitlist",
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json(
      {
        error: "Failed to process subscription. Please try again.",
      },
      { status: 500 },
    )
  }
}
