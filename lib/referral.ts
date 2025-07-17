import { BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID } from "@/lib/constants"

/**
 * Track a referral for the given email + referral code in Beehiiv.
 * If the Beehiiv environment variables are not present, we log a warning
 * and exit gracefully so local development doesn’t break.
 */
export async function trackReferral(email: string, referralCode: string): Promise<void> {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.warn("[referral] Beehiiv API keys are not configured – skipping referral tracking.")
    return
  }

  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        referral_code: referralCode,
        send_welcome_email: false,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(`[referral] Beehiiv error: ${errorData.message ?? res.statusText}`)
    }

    console.log(`[referral] Successfully tracked referral for ${email} (code: ${referralCode}).`)
  } catch (err) {
    console.error("[referral] Failed to track referral:", err)
    // Rethrow so calling code can decide how to handle the failure.
    throw err
  }
}

/**
 * Fetch referral statistics for a subscriber.
 * Returns the number of successful referrals made by the email.
 *
 * NOTE: Adjust the response parsing as needed to match the Beehiiv API.
 */
export async function getReferralStats(email: string): Promise<{ referredCount: number }> {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.warn("[referral] Beehiiv API keys are not configured – returning empty stats.")
    return { referredCount: 0 }
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions?email=${encodeURIComponent(
        email,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        // Beehiiv recommends GET requests for subscriber look-ups
        method: "GET",
      },
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(`[referral] Beehiiv stats error: ${errorData.message ?? res.statusText}`)
    }

    /**
     * Example expected payload (simplified):
     * {
     *   "data": [
     *     {
     *       "email": "jane@example.com",
     *       "referred_subscribers_count": 4,
     *       ...
     *     }
     *   ]
     * }
     */
    const { data } = (await res.json()) as {
      data: { referred_subscribers_count?: number }[]
    }

    const referredCount = data?.[0]?.referred_subscribers_count ?? 0
    return { referredCount }
  } catch (err) {
    console.error("[referral] Failed to fetch referral stats:", err)
    // Return a safe fallback so the UI can still render
    return { referredCount: 0 }
  }
}
