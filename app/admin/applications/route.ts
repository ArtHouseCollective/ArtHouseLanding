import { type NextRequest, NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    // Get all applications from Firestore
    const applicationsRef = adminDb.collection("applications")
    const snapshot = await applicationsRef.orderBy("createdAt", "desc").get()

    const applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { applicationId, status } = await request.json()

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing applicationId or status" }, { status: 400 })
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update the application status
    const applicationRef = adminDb.collection("applications").doc(applicationId)
    await applicationRef.update({
      status,
      updatedAt: new Date().toISOString(),
    })

    // If approved, set custom claims for the user
    if (status === "approved") {
      const applicationDoc = await applicationRef.get()
      const applicationData = applicationDoc.data()

      if (applicationData?.email) {
        try {
          // Get user by email
          const userRecord = await adminAuth.getUserByEmail(applicationData.email)

          // Set custom claims
          await adminAuth.setCustomUserClaims(userRecord.uid, {
            approved: true,
            role: "member",
          })
        } catch (authError) {
          console.error("Error setting custom claims:", authError)
          // Continue even if custom claims fail
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
