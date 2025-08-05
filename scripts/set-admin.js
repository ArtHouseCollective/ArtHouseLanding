import { auth } from "../lib/firebase-admin.js"

async function setAdminUser() {
  try {
    // Set admin for hello@arthousecollective.xyz
    const adminEmail = "hello@arthousecollective.xyz"

    // Get user by email
    const userRecord = await auth.getUserByEmail(adminEmail)

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: "admin",
      approved: true,
    })

    console.log(`Successfully set admin claims for ${adminEmail}`)
    console.log(`User UID: ${userRecord.uid}`)
  } catch (error) {
    console.error("Error setting admin claims:", error)
  }
}

setAdminUser()
