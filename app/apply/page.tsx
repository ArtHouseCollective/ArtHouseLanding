"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase-client"

import { RetroNav } from "@/components/retro-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Compass, Home, ImageIcon, Film, Music2, Globe, Upload } from 'lucide-react'

type IndustryId = "film_tv" | "digital" | "music"

const INDUSTRIES: { id: IndustryId; label: string; icon: React.ReactNode }[] = [
  { id: "film_tv", label: "Film & Television", icon: <Film className="h-4 w-4" /> },
  { id: "digital", label: "Digital Media", icon: <Globe className="h-4 w-4" /> },
  { id: "music", label: "Music", icon: <Music2 className="h-4 w-4" /> },
]

// Limit concise curated roles and genres to reduce clutter
const ROLES_BY_INDUSTRY: Record<IndustryId, string[]> = {
  film_tv: [
    "Director",
    "Producer",
    "Screenwriter",
    "Actor",
    "Cinematographer",
    "Editor",
    "Composer",
  ],
  digital: [
    "Content Creator",
    "YouTuber",
    "Influencer",
    "Social Media Manager",
    "Video Editor",
    "Motion Graphics",
  ],
  music: [
    "Singer",
    "Musician",
    "Songwriter",
    "DJ",
    "Music Producer",
    "Audio Engineer",
    "Composer",
  ],
}

const GENRES_BY_INDUSTRY: Record<IndustryId, string[]> = {
  film_tv: [
    "Horror",
    "Romance",
    "Thriller",
    "Drama",
    "Comedy",
    "Documentary",
    "Sci‑Fi",
    "Action",
  ],
  digital: [
    "Vlogging",
    "Tutorials",
    "Reviews",
    "Gaming",
    "Lifestyle",
    "Tech",
    "Fashion",
  ],
  music: [
    "Pop",
    "Hip‑Hop",
    "Electronic",
    "Rock",
    "Jazz",
    "Classical",
    "Soundtrack",
  ],
}

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
  const [mainPhoto, setMainPhoto] = useState<File | null>(null)
  const [demoFile, setDemoFile] = useState<File | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")

  // When admin, auto-redirect off the apply page
  useEffect(() => {
    if (approvalCheckComplete && user && isAdmin) {
      router.replace("/admin/applications")
    }
  }, [approvalCheckComplete, user, isAdmin, router])

  // Auth state + approval check
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

  // Computed options based on industry
  const roleOptions = useMemo(() => (industry ? ROLES_BY_INDUSTRY[industry] : []), [industry])
  const genreOptions = useMemo(() => (industry ? GENRES_BY_INDUSTRY[industry] : []), [industry])

  // Reset dependent selections when industry changes
  useEffect(() => {
    setRoles([])
    setGenres([])
  }, [industry])

  // Selection helpers (min 1, max 3)
  const toggleSelection = (list: string[], setList: (val: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value))
    } else {
      if (list.length >= 3) return // enforce max 3
      setList([...list, value])
    }
  }

  const rolesAtMax = roles.length >= 3
  const genresAtMax = genres.length >= 3

  const canSubmit =
    !isSubmitting &&
    website.trim().length > 0 &&
    industry !== "" &&
    roles.length >= 1 &&
    roles.length <= 3 &&
    genres.length >= 1 &&
    genres.length <= 3 &&
    email.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Note: for now we send file metadata; hook up Blob/S3 upload later.
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
          mainPhoto: mainPhoto
            ? { name: mainPhoto.name, size: mainPhoto.size, type: mainPhoto.type }
            : null,
          demo: demoFile ? { name: demoFile.name, size: demoFile.size, type: demoFile.type } : null,
        },
        submittedAt: new Date().toISOString(),
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to submit application.")
      }

      setIsSubmitted(true)
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

  // If admin, short-circuit (redirect effect above)
  if (approvalCheckComplete && user && isAdmin) return null

  // Already approved (non-admin)
  if (user && isApproved) {
    return (
      <div className="min-h-screen bg-black text-white">
        <RetroNav />
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Already Approved!</h2>
                  <p className="text-zinc-400 mb-4">You're already a member of ArtHouse.</p>
                  <p className="text-sm text-zinc-500">
                    Logged in as: <span className="text-zinc-300">{user?.email}</span>
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
                    className="w-full border-zinc-600 text-white hover:bg-zinc-800"
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

  // Submitted success view
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <RetroNav />
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                  <p className="text-zinc-400 mb-4">
                    Thank you for applying to ArtHouse. We’ll review your application and get back to you.
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

  // Main streamlined application form
  return (
    <div className="min-h-screen bg-black text-white">
      <RetroNav />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
        <Button variant="ghost" onClick={() => router.push("/")} className="text-zinc-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent">
              Apply to ArtHouse
            </span>
          </h1>
          <p className="text-zinc-300 max-w-2xl mx-auto">
            A concise application focused on your craft. Share your core links, pick your industry, and select up to 3
            roles and interests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact + Links */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Contact & Links</CardTitle>
              <CardDescription className="text-zinc-400">Minimal and focused</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                    placeholder="hello@studio.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-white">
                  Website / Portfolio *
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram" className="text-white">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                    placeholder="@yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="additional" className="text-white">
                    Additional (YouTube, IMDb, Vimeo, Spotify, etc.)
                  </Label>
                  <Input
                    id="additional"
                    value={additional}
                    onChange={(e) => setAdditional(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                    placeholder="Link to your reel, channel, profile..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Industry *</CardTitle>
              <CardDescription className="text-zinc-400">Choose one</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {INDUSTRIES.map((opt) => {
                  const active = industry === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIndustry(opt.id)}
                      className={[
                        "rounded-lg border p-3 text-left transition",
                        "bg-zinc-900/60 hover:bg-zinc-900",
                        active ? "border-white" : "border-zinc-700",
                      ].join(" ")}
                      aria-pressed={active}
                    >
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span className="font-medium">{opt.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Creative Roles (1–3)</CardTitle>
              <CardDescription className="text-zinc-400">
                Options match your selected industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              {industry === "" ? (
                <p className="text-zinc-400 text-sm">Select an industry to choose roles.</p>
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
                            "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer",
                            checked ? "border-white bg-zinc-900" : "border-zinc-700 hover:bg-zinc-900/50",
                            disabled ? "opacity-50 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSelection(roles, setRoles, role)}
                            className="border-zinc-600"
                            disabled={disabled}
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      )
                    })}
                  </div>
                  {roles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {roles.map((r) => (
                        <Badge key={r} variant="secondary" className="bg-zinc-700 text-zinc-200">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Genres & Interests */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Genres & Interests (1–3)</CardTitle>
              <CardDescription className="text-zinc-400">
                Tailored by industry — composers can still pick film genres within Film & TV
              </CardDescription>
            </CardHeader>
            <CardContent>
              {industry === "" ? (
                <p className="text-zinc-400 text-sm">Select an industry to choose genres and interests.</p>
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
                            "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer",
                            checked ? "border-white bg-zinc-900" : "border-zinc-700 hover:bg-zinc-900/50",
                            disabled ? "opacity-50 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSelection(genres, setGenres, g)}
                            className="border-zinc-600"
                            disabled={disabled}
                          />
                          <span className="text-sm">{g}</span>
                        </label>
                      )
                    })}
                  </div>
                  {genres.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {genres.map((g) => (
                        <Badge key={g} variant="secondary" className="bg-zinc-700 text-zinc-200">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Uploads */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Media</CardTitle>
              <CardDescription className="text-zinc-400">
                A single main photo and one demo piece (video, audio, or link above)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mainPhoto" className="text-white">
                    Main Photo
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 hover:bg-zinc-900 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload image</span>
                      <input
                        id="mainPhoto"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          setMainPhoto(f)
                        }}
                      />
                    </label>
                  </div>
                  {mainPhoto && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-zinc-800/50 flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(mainPhoto) || "/placeholder.svg"}
                          alt="Main preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-zinc-400">
                        <div className="font-medium text-zinc-200">{mainPhoto.name}</div>
                        <div>{(mainPhoto.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="demo" className="text-white">
                    Demo Piece
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 hover:bg-zinc-900 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload video or audio</span>
                      <input
                        id="demo"
                        type="file"
                        accept="video/*,audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          setDemoFile(f)
                        }}
                      />
                    </label>
                  </div>
                  {demoFile && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-zinc-400">
                        <div className="font-medium text-zinc-200">{demoFile.name}</div>
                        <div>{(demoFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                      {demoFile.type.startsWith("video/") ? (
                        <video
                          controls
                          className="w-full rounded-md border border-zinc-700"
                          src={URL.createObjectURL(demoFile)}
                        />
                      ) : demoFile.type.startsWith("audio/") ? (
                        <audio controls className="w-full">
                          <source src={URL.createObjectURL(demoFile)} type={demoFile.type} />
                        </audio>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-500">
                Tip: You can also paste links above (YouTube, Vimeo, Spotify, IMDb) in the Additional field.
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="text-center pt-2">
            {submitError && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-400">{submitError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-white text-black hover:bg-zinc-200 font-semibold py-3 px-8 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
