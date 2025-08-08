import { NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { sendTransactionalEmail } from "@/lib/resend"
import { subscribeToBeehiiv } from "@/lib/beehiiv"

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

    // Prevent duplicate
    const docRef = db.collection("applications").doc(email!)
    const existing = await docRef.get()
    if (existing.exists) {
      return NextResponse.json(
        {
          error: "An application has already been submitted for this email.",
          fieldErrors: { email: "Email already has an application." },
        },
        { status: 400 },
      )
    }

    // Prepare data
    const base = {
      email,
      status: "pending",
      submittedAt: (isNew(data) && data.submittedAt) || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const applicationData = isNew(data)
      ? {
          ...base,
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
      : {
          ...base,
          firstName: (data as LegacyBody).firstName || "",
          lastName: (data as LegacyBody).lastName || "",
          profession: (data as LegacyBody).profession || "",
          experience: (data as LegacyBody).experience || "",
          portfolio: (data as LegacyBody).portfolio || "",
          socialMedia: (data as LegacyBody).socialMedia || "",
          collaborationInterest: (data as LegacyBody).collaborationInterest || "",
          additionalInfo: (data as LegacyBody).additionalInfo || "",
          source: "legacy_apply_form",
        }

    await docRef.set(applicationData)

    // Auto-subscribe the applicant to Beehiiv
    try {
      if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID && email) {
        const tags: string[] = []
        if (isNew(data)) {
          if (data.industry) tags.push(String(data.industry))
          if (Array.isArray(data.roles)) tags.push(...data.roles.slice(0, 5))
          if (Array.isArray(data.genres)) tags.push(...data.genres.slice(0, 5))
        }
        const nameStr =
          isNew(data) ? (data.name || "") : `${(data as LegacyBody).firstName || ""} ${(data as LegacyBody).lastName || ""}`

        const firstName = nameStr.trim().split(/\s+/)[0] || undefined
        const lastName = nameStr.trim().split(/\s+/).slice(1).join(" ") || undefined

        const res = await subscribeToBeehiiv(email, {
          utmSource: "ArtHouse Apply",
          sendWelcomeEmail: false,
          reactivateIfArchived: true,
          referringSite: "https://arthouse.app/apply",
          firstName,
          lastName,
          tags: tags.filter(Boolean),
        })

        if (!res.ok) {
          console.error("Beehiiv subscribe error:", res.status, res.error)
        }
      }
    } catch (bhErr) {
      console.error("Beehiiv subscribe threw:", bhErr)
    }

    // Transactional "Thanks for applying" email via Resend (if configured)
    if (process.env.RESEND_API_KEY && email) {
      try {
        await sendTransactionalEmail({
          to: email,
          subject: "Thanks for applying to ArtHouse",
          html: `
            <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827">
              <h2>Thanks for applying to ArtHouse</h2>
              <p>We received your application and our team will review it shortly.</p>
              <p>We’ll email you as soon as there’s an update.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
              <p style="font-size:12px;color:#6b7280;">If you didn’t submit this application, you can ignore this message.</p>
            </div>
          `,
          text: "Thanks for applying to ArtHouse. We received your application and will follow up soon.",
        })
      } catch (mailErr) {
        console.error("Resend email error (apply receipt):", mailErr)
        // Do not fail the request if email send fails
      }
    }

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
