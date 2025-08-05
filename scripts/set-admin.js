import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const auth = getAuth()

async function setAdminUser() {
  try {
    // Check if environment variables are set
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error("❌ Missing Firebase environment variables:")
      console.error("   FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "✅" : "❌")
      console.error("   FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "✅" : "❌")
      console.error("   FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "✅" : "❌")
      return
    }

    // Set admin for hello@arthousecollective.xyz
    const adminEmail = "hello@arthousecollective.xyz"

    console.log(`🔍 Looking for user: ${adminEmail}`)

    // Get user by email
    const userRecord = await auth.getUserByEmail(adminEmail)
    console.log(`✅ Found user: ${userRecord.uid}`)

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: "admin",
      approved: true,
    })

    console.log(`✅ Successfully set admin claims for ${adminEmail}`)
    console.log(`   User UID: ${userRecord.uid}`)
    console.log(`   Claims: admin=true, role=admin, approved=true`)
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error(`❌ User not found: hello@arthousecollective.xyz`)
      console.error(`   The user needs to sign up first before you can set admin claims.`)
    } else {
      console.error("❌ Error setting admin claims:", error.message)
    }
  }
}

setAdminUser()
