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

export async function generateReferralCode(email: string): Promise<string> {
  const prefix = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 5)
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  const referralCode = `${prefix}-${randomSuffix}`.toUpperCase()

  await db.collection("referrals").doc(referralCode).set({
    referrerEmail: email,
    signups: 0,
    clicks: 0,
    createdAt: FieldValue.serverTimestamp(),
  })

  return referralCode
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
