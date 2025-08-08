import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { email, uid } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Search for application by email
    const applicationsSnapshot = await db
      .collection("applications")
      .where("email", "==", email)
      .orderBy("submittedAt", "desc")
      .limit(1)
      .get()

    if (applicationsSnapshot.empty) {
      return NextResponse.json({ 
        application: null,
        message: "No application found for this email" 
      }, { status: 200 })
    }

    const applicationDoc = applicationsSnapshot.docs[0]
    const application = {
      id: applicationDoc.id,
      ...applicationDoc.data(),
    }

    return NextResponse.json({
      success: true,
      application,
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching user application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}