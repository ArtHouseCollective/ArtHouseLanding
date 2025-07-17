import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 })
  }

  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.error("Beehiiv API key or Publication ID not set")
    return NextResponse.json({ message: "Server configuration error" }, { status: 500 })
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
        utm_source: "ArtHouse Landing Page",
        utm_medium: "website",
        utm_campaign: "early_access",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Beehiiv API error:", errorData)
      return NextResponse.json({ message: "Failed to subscribe", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ message: "Subscription successful", data }, { status: 200 })
  } catch (error) {
    console.error("Error subscribing to Beehiiv:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
