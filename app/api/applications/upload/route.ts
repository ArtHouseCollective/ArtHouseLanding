import { NextResponse } from "next/server"
import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"
import { v4 as uuidv4 } from "uuid"

function ensureAdmin() {
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
}

export async function POST(request: Request) {
  try {
    ensureAdmin()

    const form = await request.formData()
    const file = form.get("file") as File | null
    const email = (form.get("email") as string | null)?.trim() || "anonymous"
    const kind = (form.get("kind") as string | null)?.trim() || "attachment"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
    const timestamp = Date.now()
    const safeEmail = email.replace(/[^\w.-]+/g, "_")
    const path = `applications/${safeEmail}/${kind}-${timestamp}.${ext}`

    const bucket = getStorage().bucket()
    const token = uuidv4()

    await bucket.file(path).save(buffer, {
      contentType: file.type || "application/octet-stream",
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
      resumable: false,
      validation: "md5",
    })

    const bucketName = bucket.name
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
      path,
    )}?alt=media&token=${token}`

    return NextResponse.json({ ok: true, path, bucket: bucketName, url, contentType: file.type })
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json({ ok: false, error: err?.message || "Upload failed." }, { status: 500 })
  }
}
