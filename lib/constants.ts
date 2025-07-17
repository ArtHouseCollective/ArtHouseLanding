//
// Shared typed accessors for all secret keys & IDs.
// Keep every string non-empty in production but guard during local dev.
//
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? ""

export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL ?? ""

export const FIREBASE_PRIVATE_KEY =
  // GitHub / Vercel automatically convert line-breaks to '\n'
  (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n")

export const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY ?? ""

export const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID ?? ""
