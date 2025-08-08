# ArtHouse Landing Website

This repository contains the **ArtHouse Landing Website** — the marketing and onboarding hub for the ArtHouse creative networking platform.

The website's purpose is to:
- Present the **ArtHouse brand** in a premium, minimal, tech-forward aesthetic.
- Collect **email signups** via Beehiiv.
- Allow creatives to **apply** for platform access via a Firebase-connected artist form.
- Serve as a secure, reliable entry point without breaking mobile app backend integrations.

---

## 1. Tech Stack

- **Framework:** [V0 by Vercel](https://v0.dev) (Next.js-based)
- **Hosting:** [Vercel](https://vercel.com/)
- **Backend Services:**
  - **Beehiiv API** → newsletter subscription
  - **Firebase** → application form submissions
- **Repository:** [`arthousecollective/arthouselanding`](https://github.com/arthousecollective/arthouselanding)
- **Deployment:** `main` branch → production  
  `dev` branch → staging / preview

---

## 2. Brand & Styling Guidelines

- **Color palette:** Pure **black & white** only (no additional colors unless explicitly approved).
- **Fonts:** Minimal, monospace, slightly tech-inspired.
- **Layout:** Clean, minimal, with cinematic scrolling features (carousel cards, text reveals).
- **Animations:** Smooth, subtle, premium feel — never distracting.
- **Do NOT** alter brand styling without explicit approval.

---

## 3. Page Structure

### Home Page
- Features a **Beehiiv email signup** form.
- Minimal hero section, brand logo, and brief copy.
- Scrolling feature sections.

### Apply Page
- Artist application form.
- Form fields:
  - Name
  - Email
  - Creative Role
  - Location
  - Portfolio Link
  - Short Bio
- Submissions:
  - Stored in **Firebase** (Firestore or RTDB).
  - Optional push to **Beehiiv** if email provided (avoid duplicates).
- Validation:
  - All fields required unless explicitly marked optional.

---

## 4. Integration Rules

- **Beehiiv:**
  - Maintain existing working subscription logic.
  - Ensure no regression in home page signup form.
- **Firebase:**
  - Do NOT change rules, indexes, or sensitive settings without approval.
  - Store application data in a clearly defined collection (e.g., `/applications`).
  - Confirm admin visibility in Firebase Console.

---

## 5. Development Workflow

1. Create a **feature branch** from `dev`.
2. Implement and test changes locally.
3. Commit and push to **`dev` branch**.
4. Use **Vercel Preview Deployment** to verify functionality & styling.
5. Once approved, merge `dev` → `main`.

---

## 6. Deployment Rules

- **SSL:** All pages must be HTTPS-secured.
- If domain routing involves Squarespace, coordinate DNS changes to avoid downtime.
- Check SSL status post-deployment.

---

## 7. Security & Data Protection

- No user data may be deleted, overwritten, or exposed.
- Form submissions must validate input before writing to Firebase.
- Protect API keys via `.env` variables (never commit secrets to Git).

---

## 8. Contact

For design approvals, backend changes, or sensitive integrations, contact:  
📧 hello@arthousecollective.xyz
