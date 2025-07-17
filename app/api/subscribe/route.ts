import { BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID } from "@/lib/constants"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error("Beehiiv API key or Publication ID is not set.")
      return new Response(JSON.stringify({ error: "Server configuration error. Please try again later." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
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
        utm_source: "ArtHouse_Landing_Page",
        utm_campaign: "Early_Access",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Beehiiv API error:", data)
      // Check for specific Beehiiv error messages
      if (data.message && data.message.includes("already subscribed")) {
        return new Response(JSON.stringify({ error: "You are already subscribed!" }), {
          status: 409, // Conflict
          headers: { "Content-Type": "application/json" },
        })
      }
      return new Response(JSON.stringify({ error: data.message || "Failed to subscribe. Please try again." }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ message: "Subscription successful!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Subscription endpoint error:", error)
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
