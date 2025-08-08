import { NextResponse } from "next/server"
import { isResendConfigured, sendTransactionalEmail, getDefaultFromAddress } from "@/lib/resend"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const to = (body?.to as string) ?? ""
    const subject = (body?.subject as string) ?? "ArtHouse Test Email"
    const html =
      (body?.html as string) ??
      `<div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;">
        <h2>ArtHouse Resend Test</h2>
        <p>This is a test email sent from your Next.js API route.</p>
        <p>From: ${getDefaultFromAddress()}</p>
      </div>`
    const text = (body?.text as string) ?? "ArtHouse Resend test email."

    if (!isResendConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "RESEND_API_KEY is not configured. Add it in your Vercel Project Settings and verify your sending domain in the Resend dashboard.",
        },
        { status: 400 },
      )
    }

    if (!to) {
      return NextResponse.json({ ok: false, error: "Missing 'to' in request body." }, { status: 400 })
    }

    const result = await sendTransactionalEmail({ to, subject, html, text })
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ ok: true, id: result.id })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Unknown server error." }, { status: 500 })
  }
}

export async function GET() {
  // Simple health check for quick debugging
  return NextResponse.json({
    ok: true,
    configured: isResendConfigured(),
    from: getDefaultFromAddress(),
  })
}
