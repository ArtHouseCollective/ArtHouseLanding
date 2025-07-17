import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 10)

export function generateReferralCode(): string {
  return nanoid()
}

export async function trackReferral(referralCode: string) {
  try {
    const response = await fetch("/api/trackReferral", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referralCode }),
    })

    if (!response.ok) {
      console.error("Failed to track referral:", await response.json())
    }
  } catch (error) {
    console.error("Error tracking referral:", error)
  }
}
