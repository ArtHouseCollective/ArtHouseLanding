import { NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, cert, getApps } from "firebase-admin/app"

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

const db = getFirestore()

export async function POST(request: Request) {
  try {
    console.log("Application submission started")

    const body = await request.text()
    console.log("Raw request body:", body)

    let data
    try {
      data = JSON.parse(body)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const {
      email,
      firstName,
      lastName,
      profession,
      experience,
      portfolio,
      socialMedia,
      collaborationInterest,
      additionalInfo,
    } = data

    console.log("Parsed application data:", {
      email,
      firstName,
      lastName,
      profession,
      hasPortfolio: !!portfolio,
      hasSocialMedia: !!socialMedia,
    })

    // Validate required fields
    if (!email || !firstName || !lastName || !profession) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email)
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if application already exists
    const existingApp = await db.collection("applications").doc(email).get()
    if (existingApp.exists) {
      console.log("Application already exists for:", email)
      return NextResponse.json({ error: "Application already submitted for this email" }, { status: 400 })
    }

    // Create application document
    const applicationData = {
      email,
      firstName,
      lastName,
      profession,
      experience: experience || "",
      portfolio: portfolio || "",
      socialMedia: socialMedia || "",
      collaborationInterest: collaborationInterest || "",
      additionalInfo: additionalInfo || "",
      status: "pending",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("Saving application to Firestore...")
    await db.collection("applications").doc(email).set(applicationData)
    console.log("Application saved successfully for:", email)

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
    })
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json(
      {
        error: "Failed to submit application. Please try again.",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    console.log("Fetching all applications...")

    const applicationsSnapshot = await db.collection("applications").orderBy("submittedAt", "desc").get()
    const applications = applicationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`Retrieved ${applications.length} applications`)

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch applications",
      },
      { status: 500 },
    )
  }
}
