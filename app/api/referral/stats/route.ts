import { NextResponse } from "next/server"
import { getReferralStats } from "@/lib/referral"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const referralCode = searchParams.get("code")

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    const stats = await getReferralStats(referralCode)

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
