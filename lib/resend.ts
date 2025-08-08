import { Resend } from "resend"

export type SendEmailArgs = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

export function getDefaultFromAddress() {
  // Set RESEND_FROM in your Vercel env for a verified sender like:
  // "ArtHouse <no-reply@your-verified-domain.com>"
  return process.env.RESEND_FROM || "ArtHouse <no-reply@your-verified-domain.com>"
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailArgs): Promise<{ ok: boolean; id?: string; error?: any }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY is not configured." }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const recipients = Array.isArray(to) ? to : [to]
  const invalid = recipients.filter((r) => !emailRegex.test(r))
  if (invalid.length > 0) {
    return { ok: false, error: `Invalid recipient email(s): ${invalid.join(", ")}` }
  }

  const fromAddress = from || getDefaultFromAddress()

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
    })

    if (result.error) {
      return { ok: false, error: result.error }
    }

    return { ok: true, id: (result.data as any)?.id }
  } catch (err: any) {
    return { ok: false, error: err?.message || "Unknown error sending email." }
  }
}
