import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, publicationId } = await request.json()

    if (!apiKey || !publicationId) {
      return NextResponse.json({ error: "API Key and Publication ID are required" }, { status: 400 })
    }

    // Test the connection by trying to fetch publication info
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Beehiiv API Error:", response.status, errorData)

      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API Key. Please check your credentials." }, { status: 401 })
      } else if (response.status === 404) {
        return NextResponse.json({ error: "Publication not found. Please check your Publication ID." }, { status: 404 })
      } else {
        return NextResponse.json({ error: `Beehiiv API error: ${response.status}` }, { status: response.status })
      }
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      publication: {
        name: data.name,
        id: data.id,
        status: data.status,
      },
    })
  } catch (error) {
    console.error("Test connection error:", error)
    return NextResponse.json({ error: "Failed to test connection" }, { status: 500 })
  }
}
