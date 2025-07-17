import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.error("Beehiiv API key or Publication ID is not set.")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        send_welcome_email: true,
        utm_source: "ArtHouseLandingPage",
        utm_medium: "website",
        utm_campaign: "early_access",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Beehiiv API error:", data)
      return NextResponse.json({ error: data.message || "Failed to subscribe" }, { status: response.status })
    }

    return NextResponse.json({ message: "Subscription successful", data })
  } catch (error) {
    console.error("Error subscribing to Beehiiv:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
