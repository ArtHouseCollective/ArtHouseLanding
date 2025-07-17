import { NextResponse } from "next/server"
import { generateReferralCode } from "@/lib/referral"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Generate a unique referral code for the new subscriber
    const referralCode = await generateReferralCode(email)

    // Integrate with Beehiiv API
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error("Beehiiv API key or Publication ID is not set.")
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 })
    }

    const response = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        referral_code: referralCode, // Pass the generated referral code
        send_welcome_email: true,
        utm_source: "ArtHouseLanding",
        utm_medium: "website",
        utm_campaign: "early_access",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Beehiiv API error:", data)
      return NextResponse.json(
        { message: data.message || "Failed to subscribe to Beehiiv" },
        { status: response.status },
      )
    }

    return NextResponse.json({ message: "Subscription successful", referralCode }, { status: 200 })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
