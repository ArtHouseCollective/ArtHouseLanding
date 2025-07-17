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

export async function getReferralCount(email: string): Promise<number> {
  try {
    const userRef = db.collection("users").doc(email)
    const doc = await userRef.get()
    if (doc.exists) {
      const userData = doc.data()
      return userData?.referralCount || 0
    }
    return 0
  } catch (error) {
    console.error("Error fetching referral count:", error)
    return 0
  }
}

export async function incrementReferralCount(email: string): Promise<void> {
  try {
    const userRef = db.collection("users").doc(email)
    await userRef.update({
      referralCount: getFirestore.FieldValue.increment(1),
    })
  } catch (error) {
    console.error("Error incrementing referral count:", error)
  }
}

export async function recordReferral(referrerEmail: string, referredEmail: string): Promise<void> {
  try {
    const referralRef = db.collection("referrals").add({
      referrer: referrerEmail,
      referred: referredEmail,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Error recording referral:", error)
  }
}
