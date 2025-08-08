import { NextResponse } from "next/server"
import { sendTransactionalEmail } from "@/lib/resend"

export async function POST(request: Request) {
  try {
    const { to } = await request.json().catch(() => ({}))
    if (!to) {
      return NextResponse.json({ error: "Missing 'to' email in JSON body." }, { status: 400 })
    }
    const res = await sendTransactionalEmail({
      to,
      subject: "ArtHouse Resend Test",
      text: "This is a test email from ArtHouse via Resend. If you received this, your configuration works.",
      html: `<p>This is a <strong>test email</strong> from ArtHouse via Resend.</p>`,
    })
    return NextResponse.json({ ok: true, id: res.data?.id })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to send test email" }, { status: 500 })
  }
}
