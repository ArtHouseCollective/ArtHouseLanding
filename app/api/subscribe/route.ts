import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          utm_source: "ArtHouse Landing Page",
          send_welcome_email: true,
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("Beehiiv API error:", data)
      return NextResponse.json({ error: data.message || "Failed to subscribe" }, { status: response.status })
    }

    return NextResponse.json({ message: "Subscribed successfully!", data }, { status: 200 })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
