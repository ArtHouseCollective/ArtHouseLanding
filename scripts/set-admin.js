import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Check if Firebase Admin environment variables are set
const requiredEnvVars = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]

const missingVars = requiredEnvVars.filter((varName) => {
  const value = process.env[varName]
  return !value || value.trim() === ""
})

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:")
  missingVars.forEach((varName) => {
    console.error(`   ${varName}`)
  })
  console.error("\n🔧 Please set these environment variables in your deployment.")
  process.exit(1)
}

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

let app
try {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
  console.log("✅ Firebase Admin initialized successfully")
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message)
  process.exit(1)
}

const auth = getAuth(app)

async function setAdminUser() {
  const adminEmail = "hello@arthousecollective.xyz"

  try {
    console.log(`🔍 Looking for user: ${adminEmail}`)

    // Get user by email
    const userRecord = await auth.getUserByEmail(adminEmail)
    console.log(`✅ Found user: ${userRecord.uid}`)

    // Set custom claims
    const customClaims = {
      admin: true,
      role: "admin",
      approved: true,
    }

    await auth.setCustomUserClaims(userRecord.uid, customClaims)
    console.log("✅ Admin claims set successfully!")

    // Verify claims were set
    const updatedUser = await auth.getUser(userRecord.uid)
    console.log("🔍 Current custom claims:", updatedUser.customClaims)

    console.log("\n🎉 Admin setup complete!")
    console.log(`👤 User: ${adminEmail}`)
    console.log("🛡️  Role: Admin")
    console.log("✅ Status: Approved")
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error(`❌ User not found: ${adminEmail}`)
      console.error("💡 The user must sign up through your app first before you can make them an admin.")
    } else {
      console.error("❌ Error setting admin user:", error.message)
    }
    process.exit(1)
  }
}

setAdminUser()
