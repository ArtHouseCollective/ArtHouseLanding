import { NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { Resend } from "resend"
import { subscribeToBeehiiv } from "@/lib/beehiiv"

// Initialize Firebase Admin SDK once
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
const adminAuth = getAuth()

type Action = "approved" | "rejected" | "waitlist" | "shortlist"

type Body = {
  applicationId?: string // this is the Firestore doc id; in our case we use email as the doc id for /applications
  action?: Action
}

export async function POST(request: Request) {
  // Parse body and validate input (model expected errors as return values) [^1][^4]
  let payload: Body | null = null
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const fieldErrors: Record<string, string> = {}
  const applicationId = payload?.applicationId?.trim()
  const action = payload?.action

  if (!applicationId) fieldErrors.applicationId = "applicationId is required."
  if (!action) fieldErrors.action = "action is required."
  if (action && !["approved", "rejected", "waitlist", "shortlist"].includes(action)) {
    fieldErrors.action = "action must be one of approved|rejected|waitlist|shortlist."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "Validation error.", fieldErrors }, { status: 400 })
  }

  try {
    const appRef = db.collection("applications").doc(applicationId!)
    const snap = await appRef.get()

    if (!snap.exists) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 })
    }

    const data = snap.data() || {}
    const email: string | undefined = (data.email as string) || applicationId!
    const name: string | undefined = (data.name as string) || `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()

    // Update application status
    const update: Record<string, any> = {
      status: action,
      updatedAt: new Date().toISOString(),
    }
    if (action === "approved") {
      update.approvedAt = new Date().toISOString()
    }
    await appRef.update(update)

    // If approved, create/update a member record, set auth claims, send acceptance email, and optionally add to Beehiiv
    let mailResult: { ok: boolean; error?: any } | null = null
    let beehiivResult: { ok: boolean; error?: any; status?: number } | null = null
    let claimsResult: { ok: boolean; error?: any } | null = null
    let membersResult: { ok: boolean; error?: any } | null = null

    if (action === "approved") {
      // 1) Upsert a members record
      try {
        const membersRef = db.collection("members").doc(email)
        await membersRef.set(
          {
            email,
            name: name ?? "",
            joinedAt: new Date().toISOString(),
            source: "admin_approval",
            applicationId,
            industry: data.industry ?? "",
            roles: data.roles ?? [],
            genres: data.genres ?? [],
            links: data.links ?? {},
            attachments: data.attachments ?? {},
            status: "active",
          },
          { merge: true },
        )
        membersResult = { ok: true }
      } catch (err) {
        console.error("Members upsert error:", err)
        membersResult = { ok: false, error: String(err) }
      }

      // 2) Try to set Firebase Auth custom claims for convenience in the app
      // If the user doesn't exist yet (hasn't logged in), this will fail silently.
      try {
        const userRecord = await adminAuth.getUserByEmail(email)
        const existingClaims = (userRecord.customClaims as Record<string, any>) || {}
        await adminAuth.setCustomUserClaims(userRecord.uid, {
          ...existingClaims,
          approved: true,
          member: true,
          role: existingClaims.role ?? "member",
        })
        claimsResult = { ok: true }
      } catch (err) {
        console.warn("Custom claims set skipped or failed (user may not exist yet):", (err as any)?.message)
        claimsResult = { ok: false, error: (err as any)?.message }
      }

      // 3) Transactional acceptance email via Resend
      const RESEND_API_KEY = process.env.RESEND_API_KEY
      if (RESEND_API_KEY && email) {
        try {
          const resend = new Resend(RESEND_API_KEY)
          const fromAddress = "ArtHouse <no-reply@your-verified-domain.com>" // Replace with your verified Resend sender
          const subject = "Welcome to the ArtHouse Collective"
          const displayName = name || email
          const html = `
            <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827">
              <h2 style="margin:0 0 8px 0;">You're in, ${displayName}.</h2>
              <p>Welcome to the ArtHouse Collective—where bold creatives meet.</p>
              <p>Next steps:</p>
              <ol>
                <li>Log in to your account with ${email}.</li>
                <li>Complete your profile and add a couple of signature pieces.</li>
                <li>Start resonating with fellow creatives.</li>
              </ol>
              <p style="margin-top:16px">We can’t wait to see what you make.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
              <p style="font-size:12px;color:#6b7280;">If this wasn’t you, you can ignore this message.</p>
            </div>
          `
          await resend.emails.send({ from: fromAddress, to: email, subject, html })
          mailResult = { ok: true }
        } catch (err) {
          console.error("Resend acceptance email error:", err)
          mailResult = { ok: false, error: String(err) }
        }
      } else {
        mailResult = { ok: false, error: "RESEND_API_KEY not configured." }
      }

      // 4) Optionally add to Beehiiv audience for ongoing comms and to reflect Collective membership in your count
      // We avoid the Beehiiv welcome email to prevent double-welcome; use transactional above.
      if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID && email) {
        const result = await subscribeToBeehiiv(email, {
          utmSource: "ArtHouseCollective",
          sendWelcomeEmail: false,
        })
        if (!result.ok) {
          console.warn("Beehiiv subscribe warning:", result.error)
        }
        beehiivResult = result
      } else {
        beehiivResult = { ok: false, status: 0, error: "Beehiiv env not configured." }
      }
    }

    return NextResponse.json({
      success: true,
      status: action,
      email,
      results: {
        members: membersResult,
        claims: claimsResult,
        email: mailResult,
        beehiiv: beehiivResult,
      },
    })
  } catch (err) {
    console.error("Approval route error:", err)
    return NextResponse.json({ error: "Failed to update application." }, { status: 500 })
  }
}
