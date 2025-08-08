type SubscribeOptions = {
  utmSource?: string
  sendWelcomeEmail?: boolean
  reactivateIfArchived?: boolean
  referringSite?: string
  // Optional fields if you want to pass name, etc.
  firstName?: string
  lastName?: string
  tags?: string[]
}

export async function subscribeToBeehiiv(
  email: string,
  opts: SubscribeOptions = {},
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    return { ok: false, error: "Missing Beehiiv environment configuration." }
  }

  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Many Beehiiv examples use Authorization: Bearer <key>.
        // If your workspace expects a different header (e.g., X-Api-Key), we can switch.
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        utm_source: opts.utmSource || "ArtHouse",
        send_welcome_email: opts.sendWelcomeEmail ?? false,
        reactivate_if_archived: opts.reactivateIfArchived ?? true,
        referring_site: opts.referringSite,
        first_name: opts.firstName,
        last_name: opts.lastName,
        tags: opts.tags,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return { ok: false, status: res.status, error: text || `Beehiiv error ${res.status}` }
    }

    return { ok: true, status: res.status }
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to contact Beehiiv." }
  }
}
