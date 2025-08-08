import { NextResponse } from "next/server"
import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"
import { v4 as uuidv4 } from "uuid"

type ErrorCode =
  | "MISSING_ENV"
  | "INIT_ERROR"
  | "BAD_REQUEST"
  | "UNSUPPORTED_TYPE"
  | "FILE_TOO_LARGE"
  | "BUCKET_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "UNKNOWN"

const MAX_BYTES = 200 * 1024 * 1024 // 200MB

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "bmp", "tiff", "avif"]
const VIDEO_EXTS = ["mp4", "mov", "m4v", "webm", "avi", "mkv", "wmv", "mpeg", "mpg", "3gp"]
const AUDIO_EXTS = ["mp3", "wav", "aac", "m4a", "flac", "ogg", "oga", "opus", "aiff", "aif"]

function extOf(name: string) {
  const part = name.split(".").pop()
  return (part || "").toLowerCase()
}

function isAllowedByExt(name: string) {
  const e = extOf(name)
  return IMAGE_EXTS.includes(e) || VIDEO_EXTS.includes(e) || AUDIO_EXTS.includes(e)
}

function isAllowedByMime(mime: string) {
  return /^image\//.test(mime) || /^video\//.test(mime) || /^audio\//.test(mime)
}

function errorJson(message: string, status = 400, code: ErrorCode = "BAD_REQUEST", extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, code, ...extra }, { status })
}

function required(name: string, value?: string | null) {
  if (!value || value.trim().length === 0) {
    throw Object.assign(new Error(`${name} is not configured`), { code: "MISSING_ENV" as ErrorCode })
  }
  return value
}

function getBucketName() {
  const explicit = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
  if (explicit) return explicit
  const projectId = required("FIREBASE_PROJECT_ID", process.env.FIREBASE_PROJECT_ID)
  return `${projectId}.appspot.com`
}

function ensureAdmin() {
  if (!getApps().length) {
    try {
      const privateKey = required(
        "FIREBASE_PRIVATE_KEY",
        process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      )
      initializeApp({
        credential: cert({
          projectId: required("FIREBASE_PROJECT_ID", process.env.FIREBASE_PROJECT_ID),
          clientEmail: required("FIREBASE_CLIENT_EMAIL", process.env.FIREBASE_CLIENT_EMAIL),
          privateKey,
        }),
        storageBucket: getBucketName(),
      })
    } catch (e: any) {
      throw Object.assign(new Error(e?.message || "Failed to initialize Firebase Admin."), {
        code: "INIT_ERROR" as ErrorCode,
      })
    }
  }
}

function slugify(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)+/g, "")
}

export async function POST(request: Request) {
  try {
    ensureAdmin()

    const form = await request.formData()
    const file = form.get("file") as File | null
    const kind = (form.get("kind") as string | null)?.trim() || "attachment"
    const email = (form.get("email") as string | null)?.trim() || "anonymous"
    const uid = (form.get("uid") as string | null)?.trim() || ""

    if (!file) return errorJson("No file provided.", 400, "BAD_REQUEST")

    const contentType = file.type || "application/octet-stream"
    const nameForCheck = (file as any).name || "upload.bin"

    // Allow when either MIME or extension is recognized
    if (!isAllowedByMime(contentType) && !isAllowedByExt(nameForCheck)) {
      return errorJson(`Unsupported file type: ${contentType}`, 415, "UNSUPPORTED_TYPE", {
        hint: "Allowed: images, videos, audio",
      })
    }

    const size = (file as any).size as number | undefined
    if (typeof size === "number" && size > MAX_BYTES) {
      return errorJson("File too large. Max size is 200MB.", 413, "FILE_TOO_LARGE")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const safeEmail = email.replace(/[^\w.-]+/g, "_") || "anonymous"
    const owner = uid || safeEmail
    const filename = slugify(nameForCheck)
    const timestamp = Date.now()
    const objectPath = `applications/${owner}/${kind}/${timestamp}-${filename}`

    const bucketName = getBucketName()
    const bucket = getStorage().bucket(bucketName)
    const token = uuidv4()

    try {
      await bucket.file(objectPath).save(buffer, {
        resumable: false,
        contentType,
        validation: "md5",
        metadata: {
          contentType,
          cacheControl: "public, max-age=31536000, immutable",
          metadata: {
            // Required for tokenized download URL
            firebaseStorageDownloadTokens: token,
          },
        },
      })
    } catch (e: any) {
      const msg = String(e?.message || e)
      if (/No such bucket/i.test(msg)) {
        return errorJson(
          `Bucket "${bucketName}" not found. Check NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET or FIREBASE_PROJECT_ID.`,
          500,
          "BUCKET_NOT_FOUND",
        )
      }
      if (/permission/i.test(msg) || /forbidden/i.test(msg)) {
        return errorJson(
          "Permission denied while writing to Cloud Storage. Ensure the service account has Storage Object Admin.",
          500,
          "PERMISSION_DENIED",
        )
      }
      return errorJson(`Upload failed: ${msg}`, 500, "UNKNOWN")
    }

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      objectPath,
    )}?alt=media&token=${token}`

    return NextResponse.json({
      ok: true,
      kind,
      path: objectPath,
      url,
      contentType,
      size,
      bucket: bucket.name,
    })
  } catch (err: any) {
    const code: ErrorCode = err?.code || "UNKNOWN"
    const message =
      code === "MISSING_ENV"
        ? err.message + " (Check your Vercel Project env vars.)"
        : err?.message || "Upload failed. Please try again."
    console.error("Upload error:", err)
    return errorJson(message, 500, code)
  }
}
