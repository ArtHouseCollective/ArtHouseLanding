import { NextResponse } from "next/server"
import { isResendConfigured, sendTransactionalEmail, getDefaultFromAddress } from "@/lib/resend"

export async function POST(request: Request) {
  try {
    const { to, subject, html, text, from } = await request.json()
    if (!to) {
      return NextResponse.json({ error: "Missing 'to' email." }, { status: 400 })
    }

    if (!isResendConfigured()) {
      return NextResponse.json({ ok: false, error: "RESEND_API_KEY is not configured." }, { status: 500 })
    }

    const result = await sendTransactionalEmail({
      to,
      subject: subject || "ArtHouse test email",
      html:
        html ||
        `<div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
          <h2>ArtHouse Resend test</h2>
          <p>If you received this, your Resend setup works.</p>
        </div>`,
      text: text || "ArtHouse Resend test: your setup works.",
      from: from || getDefaultFromAddress(),
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Invalid JSON body." }, { status: 400 })
  }
}
