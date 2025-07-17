import { getReferralCount } from "@/lib/referral"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const referralCode = searchParams.get("code")

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    const count = await getReferralCount(referralCode)
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error getting referral stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
