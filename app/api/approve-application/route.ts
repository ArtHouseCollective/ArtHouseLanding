import { NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
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
const adminAuth = getAuth()

type Action = "approved" | "rejected" | "waitlist" | "shortlist"

type Body = {
  applicationId?: string // We use applicant email as the doc id
  action?: Action
  reviewNotes?: string
  reviewedBy?: string
}

export async function POST(request: Request) {
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
    const email: string = (data.email as string) || applicationId!
    const name: string = (data.name as string) || `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()

    // Update application status
    const update: Record<string, any> = {
      status: action,
      updatedAt: new Date().toISOString(),
      reviewedBy: payload?.reviewedBy || "admin",
      reviewNotes: payload?.reviewNotes || "",
    }
    if (action === "approved") {
      update.approvedAt = new Date().toISOString()
    }
    await appRef.update(update)

    let results: Record<string, any> = {}

    if (action === "approved") {
      // Upsert into members for app-side access
      try {
        await db
          .collection("members")
          .doc(email)
          .set(
            {
              email,
              name,
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
        results.members = { ok: true }
      } catch (err: any) {
        results.members = { ok: false, error: err?.message }
      }

      // Attempt to set custom claims if the user account already exists
      try {
        const userRecord = await adminAuth.getUserByEmail(email)
        const existingClaims = (userRecord.customClaims as Record<string, any>) || {}
        await adminAuth.setCustomUserClaims(userRecord.uid, {
          ...existingClaims,
          approved: true,
          member: true,
          role: existingClaims.role ?? "member",
        })
        results.claims = { ok: true }
      } catch (err: any) {
        results.claims = { ok: false, error: err?.message || "User not found yet." }
      }

      // Send acceptance email via Resend (if configured)
      if (process.env.RESEND_API_KEY) {
        try {
          await sendTransactionalEmail({
            to: email,
            subject: "Welcome to the ArtHouse Collective",
            html: `
              <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827">
                <h2 style="margin:0 0 8px 0;">You're in${name ? `, ${name}` : ""}.</h2>
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
            `,
            text: `You're in${name ? `, ${name}` : ""}. Welcome to the ArtHouse Collective.`,
          })
          results.mail = { ok: true }
        } catch (err: any) {
          results.mail = { ok: false, error: err?.message }
        }
      } else {
        results.mail = { ok: false, error: "RESEND_API_KEY not configured." }
      }

      // Optionally add to Beehiiv audience
      if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID) {
        const bee = await subscribeToBeehiiv(email, {
          utmSource: "ArtHouseCollective",
          sendWelcomeEmail: false,
          reactivateIfArchived: true,
          firstName: name?.split(" ")?.[0],
          lastName: name?.split(" ")?.slice(1)?.join(" "),
          tags: ["collective-member"],
        })
        results.beehiiv = bee
      } else {
        results.beehiiv = { ok: false, error: "Beehiiv env not configured." }
      }
    }

    return NextResponse.json({ success: true, status: action, email, results })
  } catch (err: any) {
    console.error("Approval route error:", err)
    return NextResponse.json({ error: "Failed to update application." }, { status: 500 })
  }
}
