"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmailDialog } from "@/components/email-dialog"
import { cn } from "@/lib/utils"
import { FOUNDERS_CIRCLE_CAP, FOUNDERS_CIRCLE_FILLED } from "@/lib/constants"
import { trackReferral } from "@/lib/referral"
import { useSearchParams } from "next/navigation"

interface Creator {
  name: string
  role: string
  image: string
  genres: string[]
}

const creators: Creator[] = [
  {
    name: "Emma Wilson",
    role: "Filmmaker",
    image: "/images/creators/emilyzercher.jpg",
    genres: ["Thriller", "Narrative"],
  },
  {
    name: "Ian Chen",
    role: "Singer",
    image: "/images/creators/ethanz.jpeg",
    genres: ["Indie", "Alternative"],
  },
  {
    name: "Jacob Murray",
    role: "Writer",
    image: "/images/creators/jakejalbert.jpeg",
    genres: ["Drama", "Comedy"],
  },
  {
    name: "Rita Cole",
    role: "Actor",
    image: "/images/creators/rhondda.jpg",
    genres: ["Thriller", "Improvisational"],
  },
  {
    name: "Ava Williams",
    role: "Photographer",
    image: "/images/creators/ava-williams.jpg",
    genres: ["Portrait", "Fashion"],
  },
  {
    name: "Mario Garcia",
    role: "Musician",
    image: "/images/creators/MarioGarcia.jpg",
    genres: ["Electronic", "Ambient"],
  },
  {
    name: "Jadon Cal",
    role: "Designer",
    image: "/images/creators/JadonCal.jpg",
    genres: ["UI/UX", "Graphic"],
  },
  {
    name: "Meghan Carrasquillo",
    role: "Dancer",
    image: "/images/creators/meghancarrasquillo.jpeg",
    genres: ["Contemporary", "Hip-Hop"],
  },
  {
    name: "Avi Youabian",
    role: "Painter",
    image: "/images/creators/AviYouabian.jpeg",
    genres: ["Abstract", "Surrealism"],
  },
  {
    name: "Lauren Elyse",
    role: "Sculptor",
    image: "/images/creators/laurenelyse.jpeg",
    genres: ["Bronze", "Mixed Media"],
  },
]

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [foundersCircleStats, setFoundersCircleStats] = useState({
    filled: FOUNDERS_CIRCLE_FILLED,
    cap: FOUNDERS_CIRCLE_CAP,
  })
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("ref")

  const featureBoardRef = useRef<HTMLDivElement>(null)
  const [isFeatureBoardVisible, setIsFeatureBoardVisible] = useState(false)

  useEffect(() => {
    if (referralCode) {
      trackReferral(referralCode)
    }

    const fetchFoundersCircleStats = async () => {
      try {
        const response = await fetch("/api/referral/stats")
        if (response.ok) {
          const data = await response.json()
          setFoundersCircleStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch founders circle stats:", error)
      }
    }
    fetchFoundersCircleStats()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFeatureBoardVisible(true)
          observer.disconnect() // Disconnect after it's visible
        }
      },
      { threshold: 0.1 }, // Trigger when 10% of the element is visible
    )

    if (featureBoardRef.current) {
      observer.observe(featureBoardRef.current)
    }

    return () => {
      if (featureBoardRef.current) {
        observer.unobserve(featureBoardRef.current)
      }
    }
  }, [referralCode])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEmailDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
      {/* Founders Circle Badge */}
      <div className="fixed bottom-4 right-4 z-50 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
        {foundersCircleStats.filled} / {foundersCircleStats.cap} Founders Circle Spots Filled
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-70 z-0"></div>
        <div className="relative z-10 flex flex-col items-center space-y-6 animate-fade-in-up">
          <Image src="/placeholder-logo.svg" alt="ArtHouse Logo" width={150} height={150} className="mb-4" />
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">ArtHouse</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">Where bold creatives meet.</p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Input
              type="email"
              placeholder="Enter your email to request early access..."
              className="flex-grow bg-gray-800 border border-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-md focus:ring-2 focus:ring-yellow-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="bg-yellow-500 text-black font-bold px-6 py-2 rounded-md hover:bg-yellow-600 transition-colors"
            >
              Request Invite
            </Button>
          </form>
        </div>
      </section>

      {/* Creators Carousel Section */}
      <section className="py-16 bg-black text-center">
        <h2 className="text-4xl font-bold mb-12 text-yellow-500">Creators Already On ArtHouse</h2>
        <div className="relative w-full overflow-hidden py-4">
          <div className="flex animate-marquee whitespace-nowrap">
            {creators.concat(creators).map((creator, index) => (
              <div key={index} className="inline-block mx-4">
                <div className="flex flex-col items-center">
                  <Image
                    src={creator.image || "/placeholder.svg"}
                    alt={creator.name}
                    width={120}
                    height={120}
                    className="rounded-full object-cover w-32 h-32 border-2 border-yellow-500"
                  />
                  <p className="mt-2 text-lg font-semibold">{creator.name}</p>
                  <p className="text-sm text-gray-400">{creator.role}</p>
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {creator.genres.map((genre, i) => (
                      <span key={i} className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-300">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-8 text-gray-400 text-lg">Scroll the Circle</p>
      </section>

      {/* Feature Board Section */}
      <section
        ref={featureBoardRef}
        className={cn(
          "py-20 bg-black transition-all duration-1000 ease-out",
          isFeatureBoardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        )}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-yellow-500">BUILT FOR CREATIVES. BY CREATIVES.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Curated Onboarding */}
            <div className="relative group overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/features/curated-onboarding.png"
                alt="Curated Onboarding"
                width={600}
                height={400}
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
              <div className="relative p-8 flex flex-col justify-end h-full">
                <Image src="/public/assets/icons/collective.png" alt="Icon" width={60} height={60} className="mb-4" />
                <h3 className="text-3xl font-bold mb-2">Curated Onboarding</h3>
                <p className="text-gray-300">ArtHouse gives creatives a place to be seen — not scrolled past.</p>
              </div>
            </div>

            {/* Feature 2: Style-Based Matching */}
            <div className="relative group overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/app-mockups/creative-collaboration-in-progress.png"
                alt="Style-Based Matching"
                width={600}
                height={400}
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
              <div className="relative p-8 flex flex-col justify-end h-full">
                <Image src="/public/assets/icons/resonance.png" alt="Icon" width={60} height={60} className="mb-4" />
                <h3 className="text-3xl font-bold mb-2">Style-Based Matching</h3>
                <p className="text-gray-300">
                  A swipe-based network – curated, verified, human. Where matches are based on creative style, not
                  followers.
                </p>
              </div>
            </div>

            {/* Feature 3: Join a Collective */}
            <div className="relative group overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/public/images/creators/meghancarrasquillo2.jpg"
                alt="Join a Collective"
                width={600}
                height={400}
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
              <div className="relative p-8 flex flex-col justify-end h-full">
                <Image src="/public/assets/icons/cards 2.png" alt="Icon" width={60} height={60} className="mb-4" />
                <h3 className="text-3xl font-bold mb-2">Join a Collective</h3>
                <p className="text-gray-300">For filmmakers, actors, and visionaries. Built for craft, not clout.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gray-900 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-500">This only works if it&apos;s ours.</h2>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">Invite 3 creatives to skip the wait.</p>
        <Button
          onClick={() => setIsEmailDialogOpen(true)}
          className="bg-yellow-500 text-black font-bold px-8 py-4 rounded-md text-lg hover:bg-yellow-600 transition-colors"
        >
          Apply Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} ArtHouse. All rights reserved.</p>
      </footer>

      <EmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        initialEmail={email}
        referralCode={referralCode}
      />
    </div>
  )
}
