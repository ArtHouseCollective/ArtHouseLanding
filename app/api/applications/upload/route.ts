import { NextResponse } from "next/server"
import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"
import { v4 as uuidv4 } from "uuid"

function required(name: string, value?: string) {
  if (!value || value.length === 0) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

function getBucketName() {
  // Prefer explicit bucket; fallback to {projectId}.appspot.com
  const explicit = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  if (explicit && explicit.trim().length > 0) return explicit.trim()
  const projectId = required("FIREBASE_PROJECT_ID", process.env.FIREBASE_PROJECT_ID)
  return `${projectId}.appspot.com`
}

function ensureAdmin() {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    initializeApp({
      credential: cert({
        projectId: required("FIREBASE_PROJECT_ID", process.env.FIREBASE_PROJECT_ID),
        clientEmail: required("FIREBASE_CLIENT_EMAIL", process.env.FIREBASE_CLIENT_EMAIL),
        privateKey: required("FIREBASE_PRIVATE_KEY", privateKey),
      }),
      storageBucket: getBucketName(),
    })
  }
}

function slugify(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)+/g, "")
}

const MAX_BYTES = 200 * 1024 * 1024 // 200MB
const ALLOW = [
  /^image\//, // images
  /^video\//, // videos
  /^audio\//, // audio
]

export async function POST(request: Request) {
  try {
    ensureAdmin()

    const form = await request.formData()
    const file = form.get("file") as File | null
    const kind = (form.get("kind") as string | null)?.trim() || "attachment"
    const email = (form.get("email") as string | null)?.trim() || "anonymous"
    const uid = (form.get("uid") as string | null)?.trim() || ""

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 })
    }

    // Validation
    const contentType = file.type || "application/octet-stream"
    const allowed = ALLOW.some((re) => re.test(contentType))
    if (!allowed) {
      return NextResponse.json({ error: `Unsupported file type: ${contentType}` }, { status: 415 })
    }
    // @ts-ignore - size exists on File in web standard; supported in Next route handlers
    const size = (file as any).size as number | undefined
    if (typeof size === "number" && size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large. Max size is 200MB." }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const safeEmail = email.replace(/[^\w.-]+/g, "_") || "anonymous"
    const owner = uid || safeEmail
    const filename = slugify(file.name || "upload.bin")
    const timestamp = Date.now()
    const objectPath = `applications/${owner}/${kind}/${timestamp}-${filename}`

    const bucket = getStorage().bucket(getBucketName())
    const token = uuidv4()

    await bucket.file(objectPath).save(buffer, {
      contentType,
      resumable: false,
      metadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
        metadata: {
          firebaseStorageDownloadTokens: token, // enables tokenized download URL
        },
      },
      validation: "md5",
    })

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      objectPath,
    )}?alt=media&token=${token}`

    return NextResponse.json({
      ok: true,
      kind,
      path: objectPath,
      url,
      contentType,
      size: typeof size === "number" ? size : undefined,
    })
  } catch (err: any) {
    console.error("Upload error:", err)
    // Always return JSON so the client never hits an HTML error page
    return NextResponse.json(
      {
        ok: false,
        error:
          typeof err?.message === "string"
            ? err.message
            : "Upload failed. Please check your configuration and try again.",
      },
      { status: 500 },
    )
  }
}
