export async function GET() {
  try {
    const apiKey = process.env.BEEHIIV_API_KEY
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID

    if (!apiKey || !publicationId) {
      console.error("Missing environment variables:", {
        hasApiKey: !!apiKey,
        hasPublicationId: !!publicationId,
      })
      return Response.json({
        count: 50,
        error: "Missing API credentials",
      })
    }

    // Use the subscriptions endpoint with limit=1 to get pagination info
    const url = `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions?limit=1`
    console.log("Fetching subscriber count from:", url)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Beehiiv API error:", response.status, errorText)
      return Response.json({
        count: 50,
        error: `API request failed: ${response.status}`,
      })
    }

    const data = await response.json()

    // Since there's no total_results, we need to count by fetching all pages
    // For now, let's use a reasonable estimate based on has_more
    if (data?.data && Array.isArray(data.data)) {
      if (data.has_more) {
        // If there are more results, we need to fetch all pages to get accurate count
        // For now, let's make a reasonable estimate or fetch more pages
        let totalCount = data.data.length
        let cursor = data.next_cursor

        // Fetch a few more pages to get a better count (limit to avoid infinite loop)
        let pageCount = 0
        const maxPages = 50 // Reasonable limit to avoid timeout

        while (cursor && data.has_more && pageCount < maxPages) {
          const nextUrl = `${url}&cursor=${encodeURIComponent(cursor)}`
          const nextResponse = await fetch(nextUrl, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          })

          if (nextResponse.ok) {
            const nextData = await nextResponse.json()
            totalCount += nextData.data?.length || 0
            cursor = nextData.next_cursor
            pageCount++

            if (!nextData.has_more) break
          } else {
            break
          }
        }

        console.log("Successfully counted subscribers:", totalCount)
        return Response.json({ count: totalCount })
      } else {
        // No more pages, this is the total count
        const count = data.data.length
        console.log("Successfully fetched subscriber count:", count)
        return Response.json({ count })
      }
    } else {
      console.error("Unexpected response structure:", data)
      return Response.json({
        count: 50,
        error: "Unexpected API response structure",
      })
    }
  } catch (error) {
    console.error("Error fetching subscriber count:", error)
    return Response.json({
      count: 50,
      error: "Network error",
    })
  }
}
