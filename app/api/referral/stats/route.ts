import { NextResponse } from "next/server"
import { getReferralStats } from "@/lib/referral"

export async function GET() {
  try {
    const stats = await getReferralStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ error: "Failed to fetch referral stats" }, { status: 500 })
  }
}
