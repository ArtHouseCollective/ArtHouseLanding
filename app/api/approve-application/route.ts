import { type NextRequest, NextResponse } from "next/server"
import { db, auth } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  try {
    const { applicationId, action, reviewNotes, reviewedBy } = await request.json()

    if (!applicationId || !action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Get the application
    const applicationRef = db.collection("applications").doc(applicationId)
    const applicationDoc = await applicationRef.get()

    if (!applicationDoc.exists) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const applicationData = applicationDoc.data()
    if (!applicationData) {
      return NextResponse.json({ error: "Application data not found" }, { status: 404 })
    }

    // Update application status
    await applicationRef.update({
      status: action,
      reviewedAt: Timestamp.now(),
      reviewedBy: reviewedBy || "admin",
      reviewNotes: reviewNotes || "",
    })

    // If approved, try to find existing Firebase Auth user and set custom claim
    if (action === "approved") {
      try {
        // Try to find user by email
        const userRecord = await auth.getUserByEmail(applicationData.email)

        // Set custom claim for approval
        await auth.setCustomUserClaims(userRecord.uid, {
          approved: true,
          approvedAt: new Date().toISOString(),
          roles: applicationData.creativeRoles,
        })

        // Link the user ID to the application
        await applicationRef.update({
          linkedUserId: userRecord.uid,
        })

        console.log(`Custom claims set for user: ${userRecord.uid}`)
      } catch (authError) {
        // User doesn't exist in Firebase Auth yet - that's okay
        // The claim will be set when they sign up
        console.log(`User not found in Firebase Auth: ${applicationData.email}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Application ${action} successfully`,
      applicationId,
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
