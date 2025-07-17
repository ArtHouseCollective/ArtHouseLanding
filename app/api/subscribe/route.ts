import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.error("Beehiiv API key or Publication ID is not set.")
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 })
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
        utm_source: "ArtHouse_Landing_Page",
        send_welcome_email: true,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({ message: "Subscription successful!", data })
    } else {
      console.error("Beehiiv API error:", data)
      return NextResponse.json({ error: data.message || "Failed to subscribe." }, { status: response.status })
    }
  } catch (error) {
    console.error("Network or unexpected error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
