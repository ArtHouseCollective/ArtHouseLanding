import { NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

const bucket = getStorage().bucket()

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const kind = (formData.get("kind") as string | null) || "misc"
    const uid = (formData.get("uid") as string | null) || ""
    const email = (formData.get("email") as string | null) || ""

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
      return NextResponse.json({ error: "Storage bucket is not configured." }, { status: 500 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(arrayBuffer))

    const baseName = slugify(file.name || "upload")
    const owner = uid || email.replace(/[^a-zA-Z0-9]/g, "_") || "anonymous"
    const timestamp = Date.now()
    const path = `applications/${owner}/${kind}/${timestamp}-${baseName}`

    const gcsFile = bucket.file(path)
    await gcsFile.save(buffer, {
      contentType: file.type || "application/octet-stream",
      metadata: {
        contentType: file.type || "application/octet-stream",
        cacheControl: "public, max-age=31536000, immutable",
      },
      resumable: false,
    })

    // Generate a long-lived signed URL (5 years)
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 5)
    const [signedUrl] = await gcsFile.getSignedUrl({
      action: "read",
      expires,
    })

    return NextResponse.json({ url: signedUrl, path })
  } catch (err) {
    console.error("Upload error:", err)
    // Always return JSON so the client never sees an HTML error page
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}
