import { NextResponse } from "next/server"
import { BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID } from "@/lib/constants"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error("Beehiiv API keys are not configured.")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const response = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        send_welcome_email: true,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Beehiiv API error:", data)
      return NextResponse.json({ error: data.message || "Failed to subscribe" }, { status: response.status })
    }

    return NextResponse.json({ message: "Subscription successful", data }, { status: 200 })
  } catch (error) {
    console.error("Error in subscribe API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
