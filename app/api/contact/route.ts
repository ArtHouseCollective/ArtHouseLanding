import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    console.log("Processing contact form submission:", { name, email, messageLength: message.length })

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email notification to ArtHouse team
    const { data, error } = await resend.emails.send({
      from: "ArtHouse Contact <noreply@arthousecollective.xyz>",
      to: ["hello@arthousecollective.xyz"],
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Message</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">New Contact Form Message</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Someone reached out through your ArtHouse website</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0; font-size: 18px;">Contact Details</h2>
              <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #d97706;">${email}</a></p>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 18px;">Message</h2>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #d97706;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This message was sent from the ArtHouse contact form.<br>
                Reply directly to this email to respond to ${name}.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 })
    }

    // Log successful submission
    console.log("Contact form submission successful:", {
      name,
      email,
      messageLength: message.length,
      timestamp: new Date().toISOString(),
      emailId: data?.id,
    })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      {
        error: "Failed to process contact form. Please try again.",
      },
      { status: 500 },
    )
  }
}
