import { trackReferral } from "@/lib/referral"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { referrerCode, referredEmail } = await req.json()

    if (!referrerCode || !referredEmail) {
      return NextResponse.json({ error: "Referrer code and referred email are required" }, { status: 400 })
    }

    await trackReferral(referrerCode, referredEmail)
    return NextResponse.json({ message: "Referral tracked successfully" })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
