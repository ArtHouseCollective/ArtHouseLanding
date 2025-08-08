import { NextResponse } from "next/server"
import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"
import { v4 as uuidv4 } from "uuid"

function required(name: string, value?: string | null) {
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is not configured`)
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
    initializeApp({
      credential: cert({
        projectId: required("FIREBASE_PROJECT_ID", process.env.FIREBASE_PROJECT_ID),
        clientEmail: required("FIREBASE_CLIENT_EMAIL", process.env.FIREBASE_CLIENT_EMAIL),
        privateKey: required("FIREBASE_PRIVATE_KEY", process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")),
      }),
      storageBucket: getBucketName(),
    })
  }
}

export async function GET() {
  try {
    ensureAdmin()
    const bucketName = getBucketName()
    const bucket = getStorage().bucket(bucketName)

    // 1) Bucket metadata
    let metadata: any = null
    try {
      const [meta] = await bucket.getMetadata()
      metadata = meta
    } catch (e: any) {
      return NextResponse.json({
        ok: false,
        step: "getMetadata",
        bucket: bucketName,
        error: e?.message || String(e),
        hint: "If this fails, the bucket likely doesn't exist or credentials lack Storage Viewer.",
      })
    }

    // 2) Write probe
    const key = `diagnostics/probe-${Date.now()}.txt`
    const token = uuidv4()
    try {
      await bucket.file(key).save(Buffer.from("ok"), {
        resumable: false,
        contentType: "text/plain",
        metadata: {
          contentType: "text/plain",
          cacheControl: "no-cache",
          metadata: { firebaseStorageDownloadTokens: token },
        },
      })
    } catch (e: any) {
      return NextResponse.json({
        ok: false,
        step: "write",
        bucket: bucketName,
        error: e?.message || String(e),
        hint: "If this fails, grant Storage Object Admin to the service account and ensure the bucket exists.",
      })
    }

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      key,
    )}?alt=media&token=${token}`

    // 3) Cleanup
    let deleted = false
    try {
      await bucket.file(key).delete()
      deleted = true
    } catch {
      deleted = false
    }

    return NextResponse.json({
      ok: true,
      bucket: bucketName,
      metadata: { location: metadata?.location, storageClass: metadata?.storageClass },
      probe: { key, url, deleted },
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || String(e),
        hint:
          "Verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (with \\n) and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.",
      },
      { status: 500 },
    )
  }
}
