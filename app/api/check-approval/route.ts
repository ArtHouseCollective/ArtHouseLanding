import { type NextRequest, NextResponse } from "next/server"
import { auth, db } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { email, uid } = await request.json()

    if (!email && !uid) {
      return NextResponse.json({ error: "Email or UID is required" }, { status: 400 })
    }

    let userRecord
    let isApproved = false
    let approvalSource = null

    try {
      // Get user from Firebase Auth
      if (uid) {
        userRecord = await auth.getUser(uid)
      } else {
        userRecord = await auth.getUserByEmail(email)
      }

      // Check custom claims first
      if (userRecord.customClaims?.approved || userRecord.customClaims?.admin) {
        isApproved = true
        approvalSource = "custom_claims"
      }
    } catch (authError) {
      console.log("User not found in Firebase Auth, checking applications...")
    }

    // If not approved via custom claims, check applications collection
    if (!isApproved) {
      try {
        const applicationQuery = await db
          .collection("applications")
          .where("email", "==", (email || userRecord?.email || "").toLowerCase())
          .where("status", "==", "approved")
          .limit(1)
          .get()

        if (!applicationQuery.empty) {
          isApproved = true
          approvalSource = "application"

          // If user exists but doesn't have custom claims, set them now
          if (userRecord) {
            const applicationData = applicationQuery.docs[0].data()
            await auth.setCustomUserClaims(userRecord.uid, {
              approved: true,
              approvedAt: new Date().toISOString(),
              roles: applicationData.creativeRoles,
            })

            // Link the user ID to the application
            await applicationQuery.docs[0].ref.update({
              linkedUserId: userRecord.uid,
            })
          }
        }
      } catch (dbError) {
        console.error("Database query error:", dbError)
        // If database fails, allow login for existing users
        if (userRecord) {
          isApproved = true
          approvalSource = "fallback"
        }
      }
    }

    return NextResponse.json({
      isApproved,
      approvalSource,
      email: email || userRecord?.email,
      uid: userRecord?.uid,
    })
  } catch (error) {
    console.error("Error checking approval status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
