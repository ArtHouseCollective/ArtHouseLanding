import { NextResponse } from "next/server"
import { trackReferralSignup } from "@/lib/referral"

export async function POST(request: Request) {
  const { email, referralCode } = await request.json()

  if (!email || !referralCode) {
    return NextResponse.json({ error: "Email and referral code are required" }, { status: 400 })
  }

  try {
    await trackReferralSignup(email, referralCode)
    return NextResponse.json({ message: "Referral signup tracked successfully" })
  } catch (error) {
    console.error("Error tracking referral signup:", error)
    return NextResponse.json({ error: "Failed to track referral signup" }, { status: 500 })
  }
}
