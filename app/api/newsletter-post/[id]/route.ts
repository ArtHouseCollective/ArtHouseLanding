import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    return NextResponse.json({ error: "Beehiiv API credentials not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/posts/${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error("Beehiiv API error:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      return NextResponse.json({ error: "Failed to fetch newsletter post" }, { status: response.status })
    }

    const data = await response.json()
    console.log("Individual post data:", JSON.stringify(data, null, 2))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching newsletter post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
