"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase-client"

import { RetroNav } from "@/components/retro-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Compass, Home, Film, Music2, Globe, Upload, Loader2 } from 'lucide-react'

type IndustryId = "film_tv" | "digital" | "music"

const INDUSTRIES: { id: IndustryId; label: string; icon: React.ReactNode }[] = [
  { id: "film_tv", label: "Film & Television", icon: <Film className="h-4 w-4" /> },
  { id: "digital", label: "Digital Media", icon: <Globe className="h-4 w-4" /> },
  { id: "music", label: "Music", icon: <Music2 className="h-4 w-4" /> },
]

const ROLES_BY_INDUSTRY: Record<IndustryId, string[]> = {
  film_tv: ["Director", "Producer", "Screenwriter", "Actor", "Cinematographer", "Editor", "Composer"],
  digital: ["Content Creator", "YouTuber", "Influencer", "Social Media Manager", "Video Editor", "Motion Graphics"],
  music: ["Singer", "Musician", "Songwriter", "DJ", "Music Producer", "Audio Engineer", "Composer"],
}

const GENRES_BY_INDUSTRY: Record<IndustryId, string[]> = {
  film_tv: ["Horror", "Romance", "Thriller", "Drama", "Comedy", "Documentary", "Sci‑Fi", "Action"],
  digital: ["Vlogging", "Tutorials", "Reviews", "Gaming", "Lifestyle", "Tech", "Fashion"],
  music: ["Pop", "Hip‑Hop", "Electronic", "Rock", "Jazz", "Classical", "Soundtrack"],
}

type FieldErrors = Partial<{
  name: string
  email: string
  website: string
  industry: string
  roles: string
  genres: string
  mainPhoto: string
  demo: string
}>

export default function ApplyPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isApproved, setIsApproved] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [approvalCheckComplete, setApprovalCheckComplete] = useState(false)

  // Streamlined form state
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [instagram, setInstagram] = useState("")
  const [additional, setAdditional] = useState("")
  const [industry, setIndustry] = useState<IndustryId | "">("")
  const [roles, setRoles] = useState<string[]>([])
  const [genres, setGenres] = useState<string[]>([])

  // Media (local preview + uploaded URL)
  const [mainPhoto, setMainPhoto] = useState<File | null>(null)
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null)
  const [demoFile, setDemoFile] = useState<File | null>(null)
  const [demoUrl, setDemoUrl] = useState<string | null>(null)
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingDemo, setUploadingDemo] = useState(false)

  // Submission + validation
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")
  const [submitSuccess, setSubmitSuccess] = useState<string>("")
  const [errors, setErrors] = useState<FieldErrors>({})

  const firstErrorRef = useRef<HTMLDivElement | null>(null)

  // Redirect admins away from /apply
  useEffect(() => {
    if (approvalCheckComplete && user && isAdmin) {
      router.replace("/admin/applications")
    }
  }, [approvalCheckComplete, user, isAdmin, router])

  // Auth + approval check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)

      if (u) {
        try {
          const res = await fetch("/api/check-approval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: u.email, uid: u.uid }),
          })
          if (res.ok) {
            const text = await res.text()
            if (text) {
              const data = JSON.parse(text)
              setIsApproved(Boolean(data.isApproved))
              setIsAdmin(Boolean(data.isAdmin))
              if (!email) setEmail(u.email || "")
              if (!name && u.displayName) setName(u.displayName)
            }
          }
        } catch (e) {
          console.error("Approval check error:", e)
        }
      } else {
        setIsApproved(false)
        setIsAdmin(false)
      }

      setApprovalCheckComplete(true)
      setIsAuthLoading(false)
    })

    return () => unsubscribe()
  }, [email, name])

  // Computed options
  const roleOptions = useMemo(() => (industry ? ROLES_BY_INDUSTRY[industry] : []), [industry])
  const genreOptions = useMemo(() => (industry ? GENRES_BY_INDUSTRY[industry] : []), [industry])

  // Reset dependent selections when industry changes
  useEffect(() => {
    setRoles([])
    setGenres([])
    setErrors((e) => ({ ...e, roles: undefined, genres: undefined }))
  }, [industry])

  // Validations
  const rolesAtMax = roles.length >= 3
  const genresAtMax = genres.length >= 3

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) next.email = "Email is required."
    else if (!emailRegex.test(email.trim())) next.email = "Enter a valid email."

    if (!website.trim()) next.website = "Website / portfolio is required."
    if (!industry) next.industry = "Choose your industry."
    if (roles.length < 1) next.roles = "Select at least 1 role (max 3)."
    if (genres.length < 1) next.genres = "Select at least 1 genre (max 3)."

    return next
  }

  const scrollToFirstError = () => {
    if (firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Generic toggle helper
  const toggleSelection = (list: string[], setList: (val: string[]) => void, value: string) => {
    setErrors((e) => ({ ...e, roles: undefined, genres: undefined }))
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value))
    } else {
      if (list.length >= 3) return
      setList([...list, value])
    }
  }

  const canSubmit =
    !isSubmitting &&
    website.trim().length > 0 &&
    industry !== "" &&
    roles.length >= 1 &&
    roles.length <= 3 &&
    genres.length >= 1 &&
    genres.length <= 3 &&
    email.trim().length > 0

  // Upload helpers
  async function uploadFile(kind: "main" | "demo", file: File) {
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("kind", kind)
      if (user?.uid) form.append("uid", user.uid)
      if (email) form.append("email", email)

      const res = await fetch("/api/applications/upload", {
        method: "POST",
        body: form,
      })

      const contentType = res.headers.get("content-type") || ""
      if (!res.ok) {
        let message = "Upload failed. Please try again."
        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => null)
          message = data?.error || message
        }
        // surface inline field error
        setErrors((prev) => ({
          ...prev,
          [kind === "main" ? "mainPhoto" : "demo"]: message,
        }))
        throw new Error(message)
      }

      const data = contentType.includes("application/json") ? await res.json() : null
      const url = data?.url as string | undefined
      if (!url) {
        const message = "Upload succeeded but no URL returned."
        setErrors((prev) => ({
          ...prev,
          [kind === "main" ? "mainPhoto" : "demo"]: message,
        }))
        throw new Error(message)
      }

      // Clear any prior field error on success
      setErrors((prev) => ({
        ...prev,
        [kind === "main" ? "mainPhoto" : "demo"]: undefined,
      }))

      if (kind === "main") setMainPhotoUrl(url)
      else setDemoUrl(url)
    } catch (err: any) {
      // Keep a general banner error for context
      setSubmitError(err?.message || "Upload failed. Please try again.")
    } finally {
      if (kind === "main") setUploadingMain(false)
      else setUploadingDemo(false)
    }
  }

  const handleMainPhotoChange = (f: File | null) => {
    setMainPhoto(f)
    setErrors((e) => ({ ...e, mainPhoto: undefined }))
    if (f) {
      setUploadingMain(true)
      uploadFile("main", f)
    } else {
      setMainPhotoUrl(null)
    }
  }

  const handleDemoChange = (f: File | null) => {
    setDemoFile(f)
    setErrors((e) => ({ ...e, demo: undefined }))
    if (f) {
      setUploadingDemo(true)
      uploadFile("demo", f)
    } else {
      setDemoUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitSuccess("")
    setSubmitError("")

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setTimeout(scrollToFirstError, 0)
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name,
        email,
        links: {
          website,
          instagram,
          additional,
        },
        industry,
        roles,
        genres,
        attachments: {
          mainPhotoUrl: mainPhotoUrl || null,
          demoUrl: demoUrl || null,
        },
        submittedAt: new Date().toISOString(),
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const contentType = res.headers.get("content-type") || ""
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => null)
          if (data?.fieldErrors) {
            setErrors(data.fieldErrors as FieldErrors)
            setTimeout(scrollToFirstError, 0)
          }
          throw new Error(data?.error || "Failed to submit application.")
        }
        throw new Error("Failed to submit application.")
      }

      setIsSubmitted(true)
      setSubmitSuccess("Application submitted successfully!")
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong submitting your application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading while checking auth
  if (isAuthLoading || !approvalCheckComplete) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-zinc-400">Checking your status...</p>
        </div>
      </div>
    )
  }

  // If admin, short-circuit
  if (approvalCheckComplete && user && isAdmin) return null

  // Approved (non-admin)
  if (user && isApproved) {
    return (
      <div className="min-h-screen bg-black text-white">
        <RetroNav />
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <Card className="w-full max-w-md border border-white/10 bg-zinc-900/30 backdrop-blur-xl shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-400/15 ring-1 ring-emerald-400/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Already Approved!</h2>
                  <p className="text-zinc-300 mb-4">You're already a member of ArtHouse.</p>
                  <p className="text-sm text-zinc-400">
                    Logged in as: <span className="text-zinc-200">{user?.email}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <Button onClick={() => router.push("/")} className="w-full bg-white text-black hover:bg-zinc-200">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                  <Button
                    onClick={() => router.push("/discover")}
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-white/5"
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Explore ArtHouse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <RetroNav />
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <Card className="w-full max-w-md border border-white/10 bg-zinc-900/30 backdrop-blur-xl shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-400/15 ring-1 ring-emerald-400/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                  <p className="text-zinc-300 mb-4">
                    Share your latest work with the community while we review your application.
                  </p>
                </div>
                <Button onClick={() => router.push("/")} className="w-full bg-white text-black hover:bg-zinc-200">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute inset-0 bg-gradient-radial from-zinc-800/20 via-transparent to-black/40" />
      
      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cobalt-600/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-cobalt-700/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      <RetroNav />
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <Button variant="ghost" onClick={() => router.push("/")} className="text-zinc-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 relative">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Apply to ArtHouse
              </span>
              <div className="absolute inset-0 text-5xl md:text-7xl font-bold blur-xl opacity-20 bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent">
                Apply to ArtHouse
              </div>
            </h1>
          </div>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join the future of creative collaboration. Share your vision, showcase your craft.
          </p>
          <div className="flex items-center justify-center space-x-2 text-cobalt-400">
            <div className="w-2 h-2 bg-cobalt-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium tracking-wide">SECURE APPLICATION</span>
            <div className="w-2 h-2 bg-cobalt-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Contact + Links */}
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cobalt-600/50 via-white/20 to-cobalt-600/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <Card className="relative border border-zinc-700/50 bg-zinc-950/70 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <CardHeader>
              <CardTitle className="text-white text-xl font-semibold flex items-center">
                <div className="w-2 h-2 bg-cobalt-400 rounded-full mr-3 animate-pulse" />
                Contact & Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={!name && errors.name ? firstErrorRef : null}>
                  <Label htmlFor="name" className="text-zinc-100">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setErrors((er) => ({ ...er, name: undefined }))
                    }}
                    className={`bg-zinc-900/70 text-white placeholder:text-zinc-400 border-zinc-600/50 focus:border-cobalt-400 focus:ring-2 focus:ring-cobalt-400/20 backdrop-blur-sm transition-all duration-300 ${
                      errors.name ? "border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    placeholder="Your name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div ref={errors.email ? firstErrorRef : null}>
                  <Label htmlFor="email" className="text-zinc-100">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors((er) => ({ ...er, email: undefined }))
                    }}
                    required
                    className={`bg-zinc-900/70 text-white placeholder:text-zinc-400 border-zinc-600/50 focus:border-cobalt-400 focus:ring-2 focus:ring-cobalt-400/20 backdrop-blur-sm transition-all duration-300 ${
                      errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                    placeholder="hello@studio.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div ref={errors.website ? firstErrorRef : null}>
                <Label htmlFor="website" className="text-zinc-100">
                  Website / Portfolio
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value)
                    setErrors((er) => ({ ...er, website: undefined }))
                  }}
                  required
                  className={`bg-zinc-900/70 text-white placeholder:text-zinc-400 border-zinc-600/50 focus:border-cobalt-400 focus:ring-2 focus:ring-cobalt-400/20 backdrop-blur-sm transition-all duration-300 ${
                    errors.website ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  placeholder="https://yourwebsite.com"
                  aria-invalid={Boolean(errors.website)}
                  aria-describedby={errors.website ? "website-error" : undefined}
                />
                {errors.website && (
                  <p id="website-error" className="mt-1 text-sm text-red-500">
                    {errors.website}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram" className="text-zinc-100">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="bg-zinc-900/70 text-white placeholder:text-zinc-400 border-zinc-600/50 focus:border-cobalt-400 focus:ring-2 focus:ring-cobalt-400/20 backdrop-blur-sm transition-all duration-300"
                    placeholder="@yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="additional" className="text-zinc-100">
                    Additional (YouTube, IMDb, Vimeo, Spotify, etc.)
                  </Label>
                  <Input
                    id="additional"
                    value={additional}
                    onChange={(e) => setAdditional(e.target.value)}
                    className="bg-zinc-900/70 text-white placeholder:text-zinc-400 border-zinc-600/50 focus:border-cobalt-400 focus:ring-2 focus:ring-cobalt-400/20 backdrop-blur-sm transition-all duration-300"
                    placeholder="Link to your reel, channel, profile..."
                  />
                </div>
              </div>
            </CardContent>
            </Card>
          </div>

          {/* Industry */}
          <div className="relative mb-8 group" ref={errors.industry ? firstErrorRef : null}>
            <div className="absolute -inset-1 bg-gradient-to-r from-cobalt-600/50 via-white/20 to-cobalt-600/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <Card className="relative border border-zinc-700/50 bg-zinc-950/70 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <CardHeader>
              <CardTitle className="text-white text-xl font-semibold flex items-center">
                <div className="w-2 h-2 bg-cobalt-400 rounded-full mr-3 animate-pulse" />
                Industry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {INDUSTRIES.map((opt) => {
                  const active = industry === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setIndustry(opt.id)
                        setErrors((er) => ({ ...er, industry: undefined }))
                      }}
                      className={[
                        "rounded-lg border p-3 text-left transition",
                        "bg-white/80 hover:bg-white/90",
                        active ? "border-zinc-900/30 ring-1 ring-zinc-900/10" : "border-white/40",
                        errors.industry && !active ? "outline outline-1 outline-red-500/60" : "",
                      ].join(" ")}
                      aria-pressed={active}
                      aria-invalid={Boolean(errors.industry) && !active}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-900">{opt.icon}</span>
                        <span className="font-medium text-zinc-900">{opt.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              {errors.industry && <p className="mt-2 text-sm text-red-500">{errors.industry}</p>}
            </CardContent>
            </Card>
          </div>

          {/* Roles */}
          <div className="relative mb-8 group" ref={errors.roles ? firstErrorRef : null}>
            <div className="absolute -inset-1 bg-gradient-to-r from-cobalt-600/50 via-white/20 to-cobalt-600/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <Card className="relative border border-zinc-700/50 bg-zinc-950/70 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <CardHeader>
              <CardTitle className="text-white">Creative Roles (1–3)</CardTitle>
            </CardHeader>
            <CardContent>
              {industry === "" ? (
                <p className="text-zinc-200 text-sm">Select an industry to choose roles.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {roleOptions.map((role) => {
                      const checked = roles.includes(role)
                      const disabled = !checked && rolesAtMax
                      return (
                        <label
                          key={role}
                          className={[
                            "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition",
                            checked
                              ? "border-zinc-900/30 bg-white/90 ring-1 ring-zinc-900/10"
                              : "border-white/40 bg-white/80 hover:bg-white/90",
                            disabled ? "opacity-50 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSelection(roles, setRoles, role)}
                            className="border-zinc-900/30 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 data-[state=checked]:text-white"
                            disabled={disabled}
                            aria-invalid={Boolean(errors.roles)}
                          />
                          <span className="text-sm text-zinc-900">{role}</span>
                        </label>
                      )
                    })}
                  </div>
                  {roles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {roles.map((r) => (
                        <Badge key={r} variant="secondary" className="bg-white/90 text-zinc-900 border border-zinc-900/10">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.roles && <p className="mt-2 text-sm text-red-500">{errors.roles}</p>}
                </>
              )}
            </CardContent>
            </Card>
          </div>

          {/* Genres & Interests */}
          <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg" ref={errors.genres ? firstErrorRef : null}>
            <CardHeader>
              <CardTitle className="text-white">Genres & Interests (1–3)</CardTitle>
            </CardHeader>
            <CardContent>
              {industry === "" ? (
                <p className="text-zinc-200 text-sm">Select an industry to choose genres and interests.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {genreOptions.map((g) => {
                      const checked = genres.includes(g)
                      const disabled = !checked && genresAtMax
                      return (
                        <label
                          key={g}
                          className={[
                            "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition",
                            checked
                              ? "border-zinc-900/30 bg-white/90 ring-1 ring-zinc-900/10"
                              : "border-white/40 bg-white/80 hover:bg-white/90",
                            disabled ? "opacity-50 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSelection(genres, setGenres, g)}
                            className="border-zinc-900/30 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 data-[state=checked]:text-white"
                            disabled={disabled}
                            aria-invalid={Boolean(errors.genres)}
                          />
                          <span className="text-sm text-zinc-900">{g}</span>
                        </label>
                      )
                    })}
                  </div>
                  {genres.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {genres.map((g) => (
                        <Badge key={g} variant="secondary" className="bg-white/90 text-zinc-900 border border-zinc-900/10">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.genres && <p className="mt-2 text-sm text-red-500">{errors.genres}</p>}
                </>
              )}
            </CardContent>
          </Card>

          {/* Uploads */}
          <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={errors.mainPhoto ? firstErrorRef : null}>
                  <Label htmlFor="mainPhoto" className="text-zinc-100">
                    Main Photo
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 rounded-md border border-white/40 bg-white/80 px-3 py-2 hover:bg-white/90 cursor-pointer">
                      {uploadingMain ? (
                        <Loader2 className="h-4 w-4 text-zinc-900 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 text-zinc-900" />
                      )}
                      <span className="text-sm text-zinc-900">{uploadingMain ? "Uploading..." : "Upload image"}</span>
                      <input
                        id="mainPhoto"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          handleMainPhotoChange(f)
                        }}
                        aria-invalid={Boolean(errors.mainPhoto)}
                        aria-describedby={errors.mainPhoto ? "mainPhoto-error" : undefined}
                      />
                    </label>
                  </div>
                  {mainPhoto && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-white/80 border border-zinc-900/10 flex items-center justify-center">
                        <img src={URL.createObjectURL(mainPhoto) || "/placeholder.svg"} alt="Main preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="text-xs text-zinc-800">
                        <div className="font-medium text-zinc-900">{mainPhoto.name}</div>
                        <div className="text-zinc-700">{(mainPhoto.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  )}
                  {errors.mainPhoto && (
                    <p id="mainPhoto-error" className="mt-1 text-sm text-red-500">
                      {errors.mainPhoto}
                    </p>
                  )}
                </div>

                <div ref={errors.demo ? firstErrorRef : null}>
                  <Label htmlFor="demo" className="text-zinc-100">
                    Demo Piece
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 rounded-md border border-white/40 bg-white/80 px-3 py-2 hover:bg-white/90 cursor-pointer">
                      {uploadingDemo ? (
                        <Loader2 className="h-4 w-4 text-zinc-900 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 text-zinc-900" />
                      )}
                      <span className="text-sm text-zinc-900">{uploadingDemo ? "Uploading..." : "Upload video or audio"}</span>
                      <input
                        id="demo"
                        type="file"
                        accept="video/*,audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          handleDemoChange(f)
                        }}
                        aria-invalid={Boolean(errors.demo)}
                        aria-describedby={errors.demo ? "demo-error" : undefined}
                      />
                    </label>
                  </div>
                  {demoFile && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-zinc-800">
                        <div className="font-medium text-zinc-900">{demoFile.name}</div>
                        <div className="text-zinc-700">{(demoFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                      {demoFile.type.startsWith("video/") ? (
                        <video
                          controls
                          className="w-full rounded-md border border-zinc-900/10 bg-white/80"
                          src={URL.createObjectURL(demoFile)}
                        />
                      ) : demoFile.type.startsWith("audio/") ? (
                        <audio controls className="w-full">
                          <source src={URL.createObjectURL(demoFile)} type={demoFile.type} />
                        </audio>
                      ) : null}
                    </div>
                  )}
                  {errors.demo && (
                    <p id="demo-error" className="mt-1 text-sm text-red-500">
                      {errors.demo}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-300">
                Tip: You can also paste links above (YouTube, Vimeo, Spotify, IMDb) in the Additional field.
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="text-center pt-2">
            {submitError && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p className="text-red-300">{submitError}</p>
              </div>
            )}
            {submitSuccess && (
              <div className="mb-4 p-4 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
                <p className="text-emerald-300">{submitSuccess}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit || uploadingMain || uploadingDemo}
              className="bg-white text-black hover:bg-zinc-200 font-semibold py-3 px-8 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </span>
              ) : (
                "Submit Application"
              )}
            </Button>
            {(uploadingMain || uploadingDemo) && (
              <p className="mt-2 text-sm text-zinc-400">Please wait for uploads to finish before submitting.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
