import { NextResponse } from "next/server"

export async function GET() {
  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    return NextResponse.json({ error: "Beehiiv API credentials not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/posts?status=confirmed&limit=10&order_by=publish_date`,
      {
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error("Beehiiv API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch newsletter posts" }, { status: response.status })
    }

    const data = await response.json()

    // Log the raw data to debug what we're getting
    console.log("Beehiiv API response:", JSON.stringify(data, null, 2))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching newsletter posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
