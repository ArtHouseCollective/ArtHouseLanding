import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, cert, getApps } from "firebase-admin/app"

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

const db = getFirestore()

export async function generateReferralCode(email: string): Promise<string> {
  const emailPrefix = email.split("@")[0]
  let referralCode = `${emailPrefix}-${Math.random().toString(36).substring(2, 8)}`
  let docRef = db.collection("referrals").doc(referralCode)
  let doc = await docRef.get()

  // Ensure the generated code is unique
  while (doc.exists) {
    referralCode = `${emailPrefix}-${Math.random().toString(36).substring(2, 8)}`
    docRef = db.collection("referrals").doc(referralCode)
    doc = await docRef.get()
  }

  await docRef.set({
    email,
    createdAt: new Date(),
  })

  return referralCode
}

export async function trackReferral(referrerCode: string, referredEmail: string): Promise<void> {
  const referrerDocRef = db.collection("referrals").doc(referrerCode)
  const referrerDoc = await referrerDocRef.get()

  if (!referrerDoc.exists) {
    console.warn(`Referrer code ${referrerCode} not found. Cannot track referral.`)
    return
  }

  await referrerDocRef.collection("referredUsers").add({
    email: referredEmail,
    timestamp: new Date(),
  })
}

export async function getReferralCount(referralCode: string): Promise<number> {
  const referredUsersSnapshot = await db.collection("referrals").doc(referralCode).collection("referredUsers").get()
  return referredUsersSnapshot.size
}
