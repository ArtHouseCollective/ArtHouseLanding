import { type NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initializeFirebaseAdmin } from "@/lib/firebase-admin"
import { FOUNDERS_CIRCLE_CAP, FOUNDERS_CIRCLE_FILLED } from "@/lib/constants"

initializeFirebaseAdmin()

export async function GET(req: NextRequest) {
  try {
    const db = getFirestore()
    const statsDoc = await db.collection("stats").doc("foundersCircle").get()

    if (!statsDoc.exists) {
      return NextResponse.json({
        foundersCircleFilled: FOUNDERS_CIRCLE_FILLED,
        foundersCircleCap: FOUNDERS_CIRCLE_CAP,
      })
    }

    const data = statsDoc.data()
    return NextResponse.json({
      foundersCircleFilled: data?.filled || FOUNDERS_CIRCLE_FILLED,
      foundersCircleCap: data?.cap || FOUNDERS_CIRCLE_CAP,
    })
  } catch (error) {
    console.error("Error fetching founders circle stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
