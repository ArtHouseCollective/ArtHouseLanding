import { NextResponse } from "next/server"
import { trackReferralClick } from "@/lib/referral"

export async function POST(request: Request) {
  const { referralCode } = await request.json()

  if (!referralCode) {
    return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
  }

  try {
    await trackReferralClick(referralCode)
    return NextResponse.json({ message: "Referral click tracked successfully" })
  } catch (error) {
    console.error("Error tracking referral click:", error)
    return NextResponse.json({ error: "Failed to track referral click" }, { status: 500 })
  }
}
