import { NextResponse } from "next/server"
import { trackReferral } from "@/lib/referral"

export async function POST(req: Request) {
  try {
    const { email, referralCode } = await req.json()

    if (!email || !referralCode) {
      return NextResponse.json({ error: "Email and referral code are required" }, { status: 400 })
    }

    await trackReferral(email, referralCode)

    return NextResponse.json({ message: "Referral tracked successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
