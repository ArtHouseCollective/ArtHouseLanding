import { NextResponse } from "next/server"

export async function GET() {
  try {
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error("Missing Beehiiv credentials")
      return NextResponse.json({ count: 46 }, { status: 200 }) // Fallback to hardcoded value
    }

    const response = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      },
    })

    if (!response.ok) {
      console.error("Beehiiv API error:", response.status, response.statusText)
      return NextResponse.json({ count: 46 }, { status: 200 }) // Fallback to hardcoded value
    }

    const data = await response.json()
    const subscriberCount = data.data?.subscriber_count || 46

    return NextResponse.json({ count: subscriberCount }, { status: 200 })
  } catch (error) {
    console.error("Error fetching subscriber count:", error)
    return NextResponse.json({ count: 46 }, { status: 200 }) // Fallback to hardcoded value
  }
}
