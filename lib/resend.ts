import { Resend } from "resend"

type SendArgs = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string | string[]
}

export async function sendTransactionalEmail(args: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set")
  }
  const resend = new Resend(apiKey)

  const from =
    args.from?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "ArtHouse <no-reply@your-verified-domain.com>" // Set RESEND_FROM to override

  const payload = {
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    ...(args.replyTo ? { reply_to: args.replyTo } : {}),
  }

  const result = await resend.emails.send(payload)
  if (result.error) {
    throw new Error(
      typeof result.error === "string" ? result.error : JSON.stringify(result.error),
    )
  }
  return result
}
