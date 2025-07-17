import { NextResponse } from "next/server"
import { trackReferral } from "@/lib/referral"

export async function POST(request: Request) {
  try {
    const { referrerCode, referredEmail } = await request.json()

    if (!referrerCode || !referredEmail) {
      return NextResponse.json({ error: "Referrer code and referred email are required" }, { status: 400 })
    }

    await trackReferral(referrerCode, referredEmail)

    return NextResponse.json({ message: "Referral tracked successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Failed to track referral" }, { status: 500 })
  }
}
