import { initializeApp, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID } from "./constants"

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    },
  })
}

const db = getFirestore()

export async function recordReferral(referrerCode: string, newSubscriberEmail: string) {
  const referralRef = db.collection("referrals").doc(referrerCode)
  await referralRef.set(
    {
      referrals: FieldValue.arrayUnion(newSubscriberEmail),
      count: FieldValue.increment(1),
    },
    { merge: true },
  )
}

export async function getReferralStats(referralCode: string) {
  const referralDoc = await db.collection("referrals").doc(referralCode).get()
  if (referralDoc.exists) {
    return referralDoc.data()
  }
  return null
}

import { FieldValue } from "firebase-admin/firestore"
