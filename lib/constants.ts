export const BEEHIIV_API_URL = "https://api.beehiiv.com/v2"
export const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID
export const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY

export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

export const FOUNDERS_CIRCLE_LIMIT = 150
export const FOUNDERS_CIRCLE_CAP = 150
export const FOUNDERS_CIRCLE_FILLED = 33 // This would typically be fetched from a database
