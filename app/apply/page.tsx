"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
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
import { ArrowLeft, Compass, Home, Film, Music2, Globe, Upload } from 'lucide-react'

type IndustryId = "film_tv" | "digital" | "music"

const INDUSTRIES: { id: IndustryId; label: string; icon: React.ReactNode }[] = [
  { id: "film_tv", label: "Film & Television", icon: <Film className="h-4 w-4" /> },
  { id: "digital", label: "Digital Media", icon: <Globe className="h-4 w-4" /> },
  { id: "music", label: "Music", icon: <Music2 className="h-4 w-4" /> },
]

// Curated, concise role and genre sets per industry
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
      // Sending metadata for uploads for now; integrate storage in a follow-up.
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
          mainPhoto: mainPhoto ? { name: mainPhoto.name, size: mainPhoto.size, type: mainPhoto.type } : null,
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

  // Submitted success view
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
            Share your core links, pick your industry, and select up to 3 roles and interests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact + Links */}
          <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Contact & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-zinc-100">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/90 text-zinc-900 placeholder:text-zinc-600 border-white/30 focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-zinc-100">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/90 text-zinc-900 placeholder:text-zinc-600 border-white/30 focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                    placeholder="hello@studio.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-zinc-100">
                  Website / Portfolio
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                  className="bg-white/90 text-zinc-900 placeholder:text-zinc-600 border-white/30 focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                  placeholder="https://yourwebsite.com"
                />
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
                    className="bg-white/90 text-zinc-900 placeholder:text-zinc-600 border-white/30 focus-visible:ring-2 focus-visible:ring-zinc-900/20"
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
                    className="bg-white/90 text-zinc-900 placeholder:text-zinc-600 border-white/30 focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                    placeholder="Link to your reel, channel, profile..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry */}
          <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Industry</CardTitle>
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
                        "bg-white/80 hover:bg-white/90",
                        active ? "border-zinc-900/30 ring-1 ring-zinc-900/10" : "border-white/40",
                      ].join(" ")}
                      aria-pressed={active}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-900">{opt.icon}</span>
                        <span className="font-medium text-zinc-900">{opt.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Genres & Interests */}
          <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
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
                <div>
                  <Label htmlFor="mainPhoto" className="text-zinc-100">
                    Main Photo
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 rounded-md border border-white/40 bg-white/80 px-3 py-2 hover:bg-white/90 cursor-pointer">
                      <Upload className="h-4 w-4 text-zinc-900" />
                      <span className="text-sm text-zinc-900">Upload image</span>
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
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-white/80 border border-zinc-900/10 flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(mainPhoto) || "/placeholder.svg"
                          }
                          alt="Main preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-zinc-800">
                        <div className="font-medium text-zinc-900">{mainPhoto.name}</div>
                        <div className="text-zinc-700">{(mainPhoto.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="demo" className="text-zinc-100">
                    Demo Piece
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 rounded-md border border-white/40 bg-white/80 px-3 py-2 hover:bg-white/90 cursor-pointer">
                      <Upload className="h-4 w-4 text-zinc-900" />
                      <span className="text-sm text-zinc-900">Upload video or audio</span>
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
