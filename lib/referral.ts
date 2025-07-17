import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { FieldValue } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()

export function generateReferralCode(email: string): string {
  // Simple hash function for demonstration purposes
  // In a real application, you'd want a more robust, unique, and collision-resistant method
  const hash = btoa(email).substring(0, 8) // Base64 encode and take first 8 chars
  return `ARTHOUSE-${hash.toUpperCase()}`
}

export function isValidReferralCode(code: string): boolean {
  // Basic validation: starts with ARTHOUSE- and has 8 alphanumeric chars after
  return /^ARTHOUSE-[A-Z0-9]{8}$/.test(code)
}

export async function trackReferralClick(referralCode: string): Promise<void> {
  const referralRef = db.collection("referrals").doc(referralCode)
  await referralRef.update({
    clicks: FieldValue.increment(1),
    lastClickedAt: FieldValue.serverTimestamp(),
  })
}

export async function trackReferralSignup(email: string, referralCode: string): Promise<void> {
  const referralRef = db.collection("referrals").doc(referralCode)
  await referralRef.update({
    signups: FieldValue.increment(1),
    lastSignedUpAt: FieldValue.serverTimestamp(),
    referredUsers: FieldValue.arrayUnion(email),
  })
}

export async function getReferralCount(referralCode: string): Promise<number> {
  const referralDoc = await db.collection("referrals").doc(referralCode).get()
  if (referralDoc.exists) {
    return referralDoc.data()?.signups || 0
  }
  return 0
}

export async function getReferralStats(): Promise<any> {
  const snapshot = await db.collection("referrals").get()
  const stats: any[] = []
  snapshot.forEach((doc) => {
    stats.push({ id: doc.id, ...doc.data() })
  })
  return stats
}
