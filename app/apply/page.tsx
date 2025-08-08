"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, X, Home, Compass } from 'lucide-react'
import { useRouter } from "next/navigation"
import { RetroNav } from "@/components/retro-nav"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase-client"

const creativeRoles = [
  "Director",
  "Producer",
  "Screenwriter",
  "Cinematographer",
  "Editor",
  "Sound Designer",
  "Composer",
  "Production Designer",
  "Costume Designer",
  "Makeup Artist",
  "Actor",
  "Voice Actor",
  "Stunt Performer",
  "Visual Effects Artist",
  "Animator",
  "Photographer",
  "Gaffer",
  "Script Supervisor",
  "Location Manager",
  "Casting Director",
  "Music Supervisor",
  "Colorist",
  "Sound Mixer",
  "Boom Operator",
  "Camera Operator",
  "Focus Puller",
  "Grip",
  "Gaffer Assistant",
  "Set Decorator",
  "Props Master",
  "Wardrobe Stylist",
  "Hair Stylist",
  "Special Effects Coordinator",
  "Storyboard Artist",
  "Concept Artist",
  "Matte Painter",
  "Motion Graphics Designer",
  "Title Designer",
  "Trailer Editor",
  "Documentary Filmmaker",
  "Commercial Director",
  "Music Video Director",
  "Content Creator",
  "Influencer",
  "Podcaster",
  "Streamer",
  "Social Media Manager",
  "Brand Strategist",
  "Creative Director",
  "Art Director",
  "Graphic Designer",
  "Web Designer",
  "UX/UI Designer",
  "Illustrator",
  "3D Artist",
  "Game Designer",
  "Game Developer",
  "AR/VR Developer",
  "Interactive Media Artist",
  "Installation Artist",
  "Performance Artist",
  "Theater Director",
  "Playwright",
  "Stage Manager",
  "Lighting Designer",
  "Set Designer",
  "Choreographer",
  "Dancer",
  "Singer",
  "Musician",
  "Songwriter",
  "Audio Engineer",
  "Mastering Engineer",
  "Live Sound Engineer",
  "Tour Manager",
  "Booking Agent",
  "Music Producer",
  "A&R Representative",
  "Music Journalist",
  "Radio Host",
  "DJ",
  "Event Planner",
  "Festival Organizer",
  "Venue Manager",
  "Talent Agent",
  "Entertainment Lawyer",
  "Business Manager",
  "Publicist",
  "Marketing Manager",
  "Distribution Executive",
  "Film Festival Programmer",
  "Film Critic",
  "Entertainment Journalist",
  "Blogger",
  "YouTuber",
  "TikTok Creator",
  "Instagram Creator",
  "Twitch Streamer",
  "Voice Over Artist",
  "Narrator",
  "Audiobook Producer",
  "Podcast Producer",
  "Radio Producer",
  "Television Producer",
  "Showrunner",
  "Television Writer",
  "Television Director",
  "News Producer",
  "News Director",
  "Anchor",
  "Reporter",
  "Correspondent",
  "Camera Person",
  "Video Editor",
  "Motion Graphics Artist",
  "Broadcast Engineer",
  "Technical Director",
  "Other",
]

const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Film Noir",
  "History",
  "Horror",
  "Music",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Short",
  "Sport",
  "Thriller",
  "War",
  "Western",
  "Experimental",
  "Art House",
  "Independent",
  "Commercial",
  "Corporate",
  "Educational",
  "Industrial",
  "Training",
  "Promotional",
  "Music Video",
  "Commercial",
  "Web Series",
  "Podcast",
  "Live Stream",
  "Virtual Reality",
  "Augmented Reality",
  "Interactive",
  "Gaming",
  "Social Media",
  "Branded Content",
  "Influencer",
  "Lifestyle",
  "Travel",
  "Food",
  "Fashion",
  "Beauty",
  "Fitness",
  "Health",
  "Technology",
  "Business",
  "Finance",
  "Real Estate",
  "Automotive",
  "Sports",
  "Entertainment",
  "News",
  "Politics",
  "Social Issues",
  "Environmental",
  "Science",
  "Nature",
  "Wildlife",
  "Culture",
  "Arts",
  "Literature",
  "Philosophy",
  "Religion",
  "Spirituality",
  "Self-Help",
  "Motivational",
  "Educational",
  "Tutorial",
  "How-To",
  "Review",
  "Commentary",
  "Analysis",
  "Interview",
  "Talk Show",
  "Game Show",
  "Reality TV",
  "Competition",
  "Talent Show",
  "Variety Show",
  "Sketch Comedy",
  "Stand-Up Comedy",
  "Improv",
  "Theater",
  "Dance",
  "Music",
  "Concert",
  "Festival",
  "Event",
  "Conference",
  "Workshop",
  "Masterclass",
  "Webinar",
  "Live Performance",
  "Street Performance",
  "Flash Mob",
  "Protest",
  "Rally",
  "Demonstration",
  "Activism",
  "Charity",
  "Fundraising",
  "Community",
  "Local",
  "Regional",
  "National",
  "International",
  "Global",
  "Other",
]

export default function ApplyPage() {
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isApproved, setIsApproved] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [approvalCheckComplete, setApprovalCheckComplete] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    instagram: "",
    linkedin: "",
    imdb: "",
    reel: "",
    portfolio: "",
    bio: "",
    experience: "",
    goals: "",
    referralSource: "",
    creativeRoles: [] as string[],
    genres: [] as string[],
    collaborationInterests: [] as string[],
    availability: "",
    equipment: "",
    skills: "",
    achievements: "",
    inspiration: "",
    challenges: "",
    networking: "",
    feedback: "",
    additionalInfo: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (approvalCheckComplete && user && isAdmin) {
      router.replace("/admin/applications")
    }
  }, [approvalCheckComplete, user, isAdmin, router])

  // Check authentication state and approval status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Check if user is approved or admin
        try {
          const response = await fetch("/api/check-approval", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email, uid: user.uid }),
          })

          if (response.ok) {
            const responseText = await response.text()
            if (responseText) {
              try {
                const data = JSON.parse(responseText)
                setIsApproved(data.isApproved || false)
                setIsAdmin(data.isAdmin || false)
              } catch (parseError) {
                console.error("Failed to parse approval response:", parseError)
              }
            }
          }
        } catch (error) {
          console.error("Approval check error:", error)
        }
      } else {
        setIsApproved(false)
        setIsAdmin(false)
      }

      setApprovalCheckComplete(true)
      setIsAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Pre-fill email from localStorage if available
  useEffect(() => {
    const storedEmail = localStorage.getItem("applicationEmail")
    if (storedEmail && !formData.email) {
      setFormData((prev) => ({ ...prev, email: storedEmail }))
    }
  }, [formData.email])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        // Clear stored email
        localStorage.removeItem("applicationEmail")
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.error || "Failed to submit application. Please try again.")
      }
    } catch (error) {
      setSubmitError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking auth
  if (isAuthLoading || !approvalCheckComplete) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Checking your status...</p>
        </div>
      </div>
    )
  }

  // If admin, redirect away from Apply page (handled in effect above)
  if (approvalCheckComplete && user && isAdmin) {
    return null
  }

  // Show already approved message only for approved non-admin users
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
                  <p className="text-zinc-400 mb-4">
                    Your application has been approved and you're already a member of ArtHouse!
                  </p>
                  <p className="text-sm text-zinc-500">
                    Logged in as: <span className="text-zinc-300">{user?.email}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/")}
                    className="w-full bg-white text-black hover:bg-zinc-200 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                  <Button
                    onClick={() => router.push("/discover")}
                    variant="outline"
                    className="w-full border-zinc-600 text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Explore ArtHouse
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-4">
                  Need to switch accounts? Sign out and log in with a different email.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show success message if application was submitted
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
                    Thank you for applying to ArtHouse. We'll review your application and get back to you soon.
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/")}
                  className="w-full bg-white text-black hover:bg-zinc-200 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>

                <p className="text-xs text-zinc-500 mt-4">We typically review applications within 3-5 business days.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show the application form
  return (
    <div className="min-h-screen bg-black text-white">
      <RetroNav />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-zinc-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent">
                Join ArtHouse
              </span>
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Apply to join our curated community of bold creatives. Tell us about your craft, your vision, and what
              you're looking to create.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-zinc-400">Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-white">
                  Location (City, State/Country) *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                  placeholder="e.g., Los Angeles, CA or London, UK"
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Online Presence */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Online Presence</CardTitle>
              <CardDescription className="text-zinc-400">Share your professional links and portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website" className="text-white">
                    Website/Portfolio
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="text-white">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                    placeholder="@yourusername"
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin" className="text-white">
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="imdb" className="text-white">
                    IMDb
                  </Label>
                  <Input
                    id="imdb"
                    value={formData.imdb}
                    onChange={(e) => handleInputChange("imdb", e.target.value)}
                    placeholder="https://imdb.com/name/nm..."
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reel" className="text-white">
                    Demo Reel/Showreel
                  </Label>
                  <Input
                    id="reel"
                    value={formData.reel}
                    onChange={(e) => handleInputChange("reel", e.target.value)}
                    placeholder="https://vimeo.com/... or https://youtube.com/..."
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio" className="text-white">
                    Additional Portfolio Link
                  </Label>
                  <Input
                    id="portfolio"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange("portfolio", e.target.value)}
                    placeholder="Behance, Dribbble, etc."
                    className="bg-zinc-800/50 border-zinc-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creative Roles */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Creative Roles *</CardTitle>
              <CardDescription className="text-zinc-400">
                Select all roles that apply to your creative work (select at least 3)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {creativeRoles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={formData.creativeRoles.includes(role)}
                      onCheckedChange={(checked) => handleArrayChange("creativeRoles", role, checked as boolean)}
                      className="border-zinc-600"
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm text-zinc-300 cursor-pointer">
                      {role}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.creativeRoles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.creativeRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="bg-zinc-700 text-zinc-200">
                      {role}
                      <button
                        type="button"
                        onClick={() => handleArrayChange("creativeRoles", role, false)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Genres */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Genres & Interests *</CardTitle>
              <CardDescription className="text-zinc-400">
                Select genres and types of content you work with or are interested in (select at least 3)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre}`}
                      checked={formData.genres.includes(genre)}
                      onCheckedChange={(checked) => handleArrayChange("genres", genre, checked as boolean)}
                      className="border-zinc-600"
                    />
                    <Label htmlFor={`genre-${genre}`} className="text-sm text-zinc-300 cursor-pointer">
                      {genre}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="bg-zinc-700 text-zinc-200">
                      {genre}
                      <button
                        type="button"
                        onClick={() => handleArrayChange("genres", genre, false)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Background */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Professional Background</CardTitle>
              <CardDescription className="text-zinc-400">Tell us about your creative journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bio" className="text-white">
                  Professional Bio *
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  required
                  placeholder="Tell us about yourself, your creative background, and what drives your work..."
                  className="bg-zinc-800/50 border-zinc-600 text-white min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="experience" className="text-white">
                  Years of Experience *
                </Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  required
                  placeholder="e.g., 5 years, Just starting, 10+ years"
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="achievements" className="text-white">
                  Notable Projects or Achievements
                </Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange("achievements", e.target.value)}
                  placeholder="Awards, notable collaborations, projects you're proud of..."
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Goals & Collaboration */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Goals & Collaboration</CardTitle>
              <CardDescription className="text-zinc-400">What are you looking to achieve and create?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="goals" className="text-white">
                  Creative Goals *
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  required
                  placeholder="What are your creative goals? What do you hope to achieve through ArtHouse?"
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="networking" className="text-white">
                  Collaboration Interests *
                </Label>
                <Textarea
                  id="networking"
                  value={formData.networking}
                  onChange={(e) => handleInputChange("networking", e.target.value)}
                  required
                  placeholder="What types of collaborations are you interested in? What kind of creatives would you like to connect with?"
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="availability" className="text-white">
                  Current Availability
                </Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => handleInputChange("availability", e.target.value)}
                  placeholder="e.g., Available for projects, Seeking collaborators, Open to freelance work"
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Skills & Equipment */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Technical Skills & Equipment</CardTitle>
              <CardDescription className="text-zinc-400">
                What tools and skills do you bring to collaborations?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="skills" className="text-white">
                  Technical Skills
                </Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="Software, programming languages, technical abilities..."
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="equipment" className="text-white">
                  Equipment & Resources
                </Label>
                <Textarea
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => handleInputChange("equipment", e.target.value)}
                  placeholder="Cameras, editing software, studio space, etc."
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Creative Philosophy */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Creative Philosophy</CardTitle>
              <CardDescription className="text-zinc-400">Help us understand your creative perspective</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="inspiration" className="text-white">
                  Creative Inspiration
                </Label>
                <Textarea
                  id="inspiration"
                  value={formData.inspiration}
                  onChange={(e) => handleInputChange("inspiration", e.target.value)}
                  placeholder="What inspires your work? Artists, movements, experiences that influence you..."
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="challenges" className="text-white">
                  Creative Challenges
                </Label>
                <Textarea
                  id="challenges"
                  value={formData.challenges}
                  onChange={(e) => handleInputChange("challenges", e.target.value)}
                  placeholder="What challenges do you face in your creative work? What would you like to overcome?"
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* How did you hear about us */}
          <Card className="bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Discovery & Feedback</CardTitle>
              <CardDescription className="text-zinc-400">Help us improve and understand our community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="referralSource" className="text-white">
                  How did you hear about ArtHouse? *
                </Label>
                <Input
                  id="referralSource"
                  value={formData.referralSource}
                  onChange={(e) => handleInputChange("referralSource", e.target.value)}
                  required
                  placeholder="Social media, friend referral, search, etc."
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="feedback" className="text-white">
                  Feedback or Suggestions
                </Label>
                <Textarea
                  id="feedback"
                  value={formData.feedback}
                  onChange={(e) => handleInputChange("feedback", e.target.value)}
                  placeholder="Any feedback about the application process or suggestions for ArtHouse?"
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo" className="text-white">
                  Additional Information
                </Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                  placeholder="Anything else you'd like us to know?"
                  className="bg-zinc-800/50 border-zinc-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center pt-8">
            {submitError && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-400">{submitError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || formData.creativeRoles.length < 3 || formData.genres.length < 3}
              className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white font-medium py-3 px-8 rounded-full transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>

            <p className="text-sm text-zinc-500 mt-4">
              Please ensure you've selected at least 3 creative roles and 3 genres before submitting.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
