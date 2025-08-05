"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"

const creativeRoles = [
  "Director",
  "Producer",
  "Cinematographer",
  "Editor",
  "Sound Designer",
  "Composer",
  "Actor",
  "Writer",
  "Production Designer",
  "Visual Effects Artist",
  "Colorist",
  "Photographer",
  "Content Creator",
  "Musician",
  "Other",
]

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    creativeRoles: [] as string[],
    otherRole: "",
    portfolioLink: "",
    bio: "",
    referralSource: "",
    socials: [""] as string[],
    location: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Pre-fill email from localStorage if available
  useEffect(() => {
    const storedEmail = localStorage.getItem("applicationEmail")
    if (storedEmail) {
      setFormData((prev) => ({ ...prev, email: storedEmail }))
    }
  }, [])

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      creativeRoles: checked ? [...prev.creativeRoles, role] : prev.creativeRoles.filter((r) => r !== role),
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (formData.creativeRoles.length === 0) {
      setError("Please select at least one creative role.")
      setIsLoading(false)
      return
    }

    if (formData.creativeRoles.includes("Other") && !formData.otherRole.trim()) {
      setError("Please specify your other creative role.")
      setIsLoading(false)
      return
    }

    if (formData.bio.length < 50) {
      setError("Please provide a bio of at least 50 characters.")
      setIsLoading(false)
      return
    }

    try {
      // Prepare roles data - include otherRole if "Other" is selected
      const finalRoles = formData.creativeRoles.includes("Other")
        ? [...formData.creativeRoles.filter((role) => role !== "Other"), formData.otherRole]
        : formData.creativeRoles

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          creativeRoles: finalRoles,
          socials: formData.socials.filter((social) => social.trim() !== ""), // Remove empty entries
        }),
      })

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Something went wrong. Please try again."
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setIsSubmitted(true)
      // Clear stored email
      localStorage.removeItem("applicationEmail")
    } catch (err) {
      console.error("Application submission error:", err)
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError(err instanceof Error ? err.message : "Network error. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Application Submitted!</h1>
          <p className="text-zinc-400 leading-relaxed">
            Thank you for applying to ArtHouse. We'll review your application and get back to you within 5-7 business
            days.
          </p>
          <p className="text-sm text-zinc-500">Keep an eye on your inbox for updates on your application status.</p>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="text-xl font-bold text-white">ArtHouse</div>
          </div>
        </div>
      </nav>

      {/* Application Form */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Apply to ArtHouse</h1>
          <p className="text-zinc-400 text-lg">
            Tell us about yourself and your creative work. We're looking for passionate professionals ready to
            collaborate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-300">
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                required
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-300">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                placeholder="City, State/Country"
              />
            </div>
          </div>

          {/* Creative Roles */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">Creative Roles *</h2>
            <p className="text-zinc-400 text-sm">Select all that apply to your creative work:</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {creativeRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={formData.creativeRoles.includes(role)}
                    onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                    className="border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:border-white"
                  />
                  <Label htmlFor={role} className="text-zinc-300 text-sm cursor-pointer">
                    {role}
                  </Label>
                </div>
              ))}
            </div>

            {/* Other Role Text Input */}
            {formData.creativeRoles.includes("Other") && (
              <div className="space-y-2">
                <Label htmlFor="otherRole" className="text-zinc-300">
                  Please specify your other creative role *
                </Label>
                <Input
                  id="otherRole"
                  type="text"
                  value={formData.otherRole}
                  onChange={(e) => setFormData((prev) => ({ ...prev, otherRole: e.target.value }))}
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="e.g., Stunt Coordinator, Casting Director, etc."
                />
              </div>
            )}
          </div>

          {/* Portfolio & Bio */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">Your Work</h2>

            <div className="space-y-2">
              <Label htmlFor="portfolioLink" className="text-zinc-300">
                Portfolio Link *
              </Label>
              <Input
                id="portfolioLink"
                type="url"
                value={formData.portfolioLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, portfolioLink: e.target.value }))}
                required
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                placeholder="https://your-portfolio.com"
              />
              <p className="text-zinc-500 text-xs">Share your best work - website, reel, or portfolio</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-zinc-300">
                Bio *
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                required
                rows={4}
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white resize-none"
                placeholder="Tell us about yourself, your creative journey, and what you're looking to collaborate on..."
              />
              <p className="text-zinc-500 text-xs">Minimum 50 characters</p>
            </div>

            {/* Socials */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Social Media Links</Label>
              <div className="space-y-3">
                {formData.socials.map((social, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="url"
                      value={social}
                      onChange={(e) => {
                        const newSocials = [...formData.socials]
                        newSocials[index] = e.target.value
                        setFormData((prev) => ({ ...prev, socials: newSocials }))
                      }}
                      className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                      placeholder="https://instagram.com/yourhandle"
                    />
                    {formData.socials.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSocials = formData.socials.filter((_, i) => i !== index)
                          setFormData((prev) => ({ ...prev, socials: newSocials }))
                        }}
                        className="px-3 border-zinc-700 text-zinc-400 hover:text-white hover:border-white"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {formData.socials.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, socials: [...prev.socials, ""] }))
                    }}
                    className="border-zinc-700 text-zinc-400 hover:text-white hover:border-white"
                  >
                    + Add Social Link
                  </Button>
                )}
              </div>
              <p className="text-zinc-500 text-xs">Instagram, Twitter, LinkedIn, Behance, etc.</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">Additional Information</h2>

            <div className="space-y-2">
              <Label htmlFor="referralSource" className="text-zinc-300">
                How did you hear about ArtHouse?
              </Label>
              <Input
                id="referralSource"
                type="text"
                value={formData.referralSource}
                onChange={(e) => setFormData((prev) => ({ ...prev, referralSource: e.target.value }))}
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                placeholder="Friend, social media, search, etc."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-lg font-semibold bg-white text-black hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "Submitting Application..." : "Submit Application"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            By submitting this application, you agree to our{" "}
            <Link href="/privacy" className="text-zinc-300 hover:text-white underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
