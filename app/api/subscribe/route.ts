import { type NextRequest, NextResponse } from "next/server"
import { getFirestore, FieldValue, getApps, initializeApp, cert } from "firebase-admin/app"
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getAdminFirestore()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error("Missing Beehiiv environment variables")
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: "arthouse_landing",
          utm_medium: "website",
          utm_campaign: "early_access",
          publication_id: BEEHIIV_PUBLICATION_ID,
        }),
      }
    )

    const data = await response.json()

    if (response.ok) {
      // ✅ Optionally log to Firestore
      await db.collection("waitlistSignups").add({
        email,
        source: "landing",
        subscribedAt: FieldValue.serverTimestamp(),
      })

      return NextResponse.json({
        success: true,
        subscribed: true,
        email,
      })
    } else {
      console.error("Beehiiv API error:", data)

      if (
        data.errors &&
        data.errors.some((error: any) => error.code === "email_already_exists")
      ) {
        return NextResponse.json(
          { error: "This email is already subscribed!" },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
