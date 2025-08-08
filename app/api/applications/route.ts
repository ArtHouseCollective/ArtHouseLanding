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

type LegacyBody = {
  email?: string
  firstName?: string
  lastName?: string
  profession?: string
  experience?: string
  portfolio?: string
  socialMedia?: string
  collaborationInterest?: string
  additionalInfo?: string
}

type NewBody = {
  name?: string
  email?: string
  links?: { website?: string; instagram?: string; additional?: string }
  industry?: string
  roles?: string[]
  genres?: string[]
  attachments?: { mainPhotoUrl?: string | null; demoUrl?: string | null }
  submittedAt?: string
}

export async function POST(request: Request) {
  try {
    const raw = await request.text()
    let data: LegacyBody | NewBody
    try {
      data = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    // Determine shape and validate fields
    const isNew = (d: any): d is NewBody => "links" in d || "industry" in d || "roles" in d || "genres" in d

    const email = (data as any)?.email?.trim()
    const fieldErrors: Record<string, string> = {}

    if (!email) fieldErrors.email = "Email is required."
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) fieldErrors.email = "Enter a valid email."
    }

    if (isNew(data)) {
      if (!data.links?.website?.trim()) fieldErrors.website = "Website / portfolio is required."
      if (!data.industry) fieldErrors.industry = "Choose your industry."
      if (!Array.isArray(data.roles) || data.roles.length < 1) fieldErrors.roles = "Select at least 1 role."
      if (!Array.isArray(data.genres) || data.genres.length < 1) fieldErrors.genres = "Select at least 1 genre."
    } else {
      // Legacy required fields
      if (!(data as LegacyBody).firstName) fieldErrors.firstName = "First name is required."
      if (!(data as LegacyBody).lastName) fieldErrors.lastName = "Last name is required."
      if (!(data as LegacyBody).profession) fieldErrors.profession = "Profession is required."
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: "Validation error. Please review the highlighted fields.", fieldErrors },
        { status: 400 },
      )
    }

    // Check duplicate
    const docRef = db.collection("applications").doc(email!)
    const existing = await docRef.get()
    if (existing.exists) {
      return NextResponse.json(
        { error: "An application has already been submitted for this email.", fieldErrors: { email: "Email already has an application." } },
        { status: 400 },
      )
    }

    // Prepare data
    let applicationData: Record<string, any> = {
      email,
      status: "pending",
      submittedAt: (isNew(data) && data.submittedAt) || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (isNew(data)) {
      applicationData = {
        ...applicationData,
        name: data.name || "",
        industry: data.industry || "",
        roles: data.roles || [],
        genres: data.genres || [],
        links: {
          website: data.links?.website || "",
          instagram: data.links?.instagram || "",
          additional: data.links?.additional || "",
        },
        attachments: {
          mainPhotoUrl: data.attachments?.mainPhotoUrl || null,
          demoUrl: data.attachments?.demoUrl || null,
        },
        source: "new_apply_form",
      }
    } else {
      const legacy = data as LegacyBody
      applicationData = {
        ...applicationData,
        firstName: legacy.firstName || "",
        lastName: legacy.lastName || "",
        profession: legacy.profession || "",
        experience: legacy.experience || "",
        portfolio: legacy.portfolio || "",
        socialMedia: legacy.socialMedia || "",
        collaborationInterest: legacy.collaborationInterest || "",
        additionalInfo: legacy.additionalInfo || "",
        source: "legacy_apply_form",
      }
    }

    await docRef.set(applicationData)

    return NextResponse.json({ success: true, message: "Application submitted successfully." })
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit application. Please try again later." },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const snap = await db.collection("applications").orderBy("submittedAt", "desc").get()
    const applications = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ success: true, applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
