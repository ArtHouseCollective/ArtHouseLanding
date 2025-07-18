import { NextResponse } from "next/server"
import { getReferralCount } from "@/lib/referral"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const referralCode = searchParams.get("code")

  if (!referralCode) {
    return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
  }

  try {
    const count = await getReferralCount(referralCode)
    return NextResponse.json({ referralCode, count })
  } catch (error) {
    console.error("Error fetching referral count:", error)
    return NextResponse.json({ error: "Failed to fetch referral count" }, { status: 500 })
  }
}
