export type BeehiivSubscribeOptions = {
  utmSource?: string
  sendWelcomeEmail?: boolean
}

/**
 * Subscribes an email to the Beehiiv publication.
 * Returns { ok: boolean, status: number, data?: any, error?: any }
 *
 * Notes:
 * - If the email is already subscribed, Beehiiv may respond with an error; we treat non-2xx as failure but do not throw.
 * - You can safely call this on approval to ensure the member is present in your Beehiiv audience.
 */
export async function subscribeToBeehiiv(email: string, opts: BeehiivSubscribeOptions = {}) {
  const API_KEY = process.env.BEEHIIV_API_KEY
  const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

  if (!API_KEY || !PUBLICATION_ID) {
    return { ok: false, status: 0, error: "Beehiiv environment variables are not configured." }
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          email,
          utm_source: opts.utmSource ?? "ArtHouseApproval",
          send_welcome_email: opts.sendWelcomeEmail ?? false, // avoid double-welcome; keep transactional email via Resend
        }),
      },
    )

    let data: any = null
    try {
      data = await res.json()
    } catch {
      // Beehiiv sometimes returns empty; ignore JSON parse failures
    }

    if (!res.ok) {
      return { ok: false, status: res.status, error: data || { message: "Beehiiv request failed" } }
    }

    return { ok: true, status: res.status, data }
  } catch (err: any) {
    return { ok: false, status: 0, error: { message: err?.message || "Beehiiv network error" } }
  }
}
