import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.error("Beehiiv API key or Publication ID not set.")
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
        utm_source: "arthouse_landing_page",
        send_welcome_email: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Beehiiv subscription error:", errorData)
      return NextResponse.json({ error: errorData.message || "Failed to subscribe" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ message: "Subscription successful", data })
  } catch (error) {
    console.error("Error subscribing to Beehiiv:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
