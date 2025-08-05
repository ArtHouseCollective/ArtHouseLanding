import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    client: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "FOUND" : "MISSING",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "FOUND" : "MISSING",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "FOUND" : "MISSING",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "FOUND" : "MISSING",
    },
    server: {
      projectId: process.env.FIREBASE_PROJECT_ID ? "FOUND" : "MISSING",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? "FOUND" : "MISSING",
    },
  })
}
