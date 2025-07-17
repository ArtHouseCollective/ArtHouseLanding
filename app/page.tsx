"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmailDialog } from "@/components/email-dialog" // Import the new dialog component
import { UserCheck, Hand, Users } from "lucide-react" // Import Lucide icons

/* -------------------------------------------------------------------------- */
/*                               Creator Stubs                                */
/* -------------------------------------------------------------------------- */

const creators = [
  {
    name: "Jadon Cal",
    title: "Director",
    image: "/images/creators/JadonCal.jpg",
    genre: "Drama / Surreal",
    specialty: "Off Rip, Skippin' Town",
  },
  {
    name: "Avi Youabian",
    title: "Director",
    image: "/images/creators/AviYouabian.jpeg",
    genre: "Action / Drama",
    specialty: "Countdown, FBI International",
  },
  {
    name: "Meghan Carrasquillo",
    title: "Actress",
    image: "/images/creators/meghancarrasquillo2.jpg",
    genre: "Thriller / Horror",
    specialty: "Stiletto, FOUR",
  },
  {
    name: "Ethan Zeitman",
    title: "Sound Department",
    image: "/images/creators/ethanz.jpeg",
    genre: "Action, Horror",
    specialty: "Fall Guy, Bot or Not",
  },
  {
    name: "Jake Jalbert",
    title: "Cinematographer",
    image: "/images/creators/jakejalbert.jpeg",
    genre: "Action, Drama",
    specialty: "DC Down, Off Rip",
  },
  {
    name: "John Demari",
    title: "Singer / Actor",
    image: "/images/creators/beachfly.jpeg",
    genre: "Reggae, Drama",
    specialty: "Beachfly, Florida Wild",
  },
  {
    name: "Lauren Elyse Buckley",
    title: "Actress",
    image: "/images/creators/laurenelyse.jpeg",
    genre: "Comedy",
    specialty: "Magnum P.I., Foursome",
  },
  {
    name: "Rhondda Stark Atlas",
    title: "Producer",
    image: "/images/creators/rhondda.jpg",
    genre: "Comedy, Action",
    specialty: "Hacked: A Double Entendre of Rage-Fueled Karma",
  },
] as const

interface Creator {
  name: string
  title: string
  image: string
  genre: string
  specialty: string
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="flex-shrink-0 relative">
      {/* Golden glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cobalt-600/20 via-cobalt-700/30 to-cobalt-600/20 rounded-2xl blur-xl scale-110"></div>

      {/* Profile card */}
      <div className="relative bg-zinc-950/80 border border-zinc-700/50 rounded-2xl p-6 md:p-8 w-[70vw] max-w-[256px] h-[104vw] max-h-[416px] backdrop-blur-sm">
        <div className="flex flex-col items-center text-center h-full space-y-2">
          <div className="w-28 h-36 md:w-32 md:h-40 mb-4 rounded-2xl overflow-hidden">
            <img
              src={creator.image || "/placeholder.png"}
              alt={creator.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.png?height=128&width=128"
              }}
            />
          </div>
          <div className="flex flex-col items-center text-center flex-grow justify-end min-h-[120px]">
            <h3 className="text-base md:text-lg font-bold text-white leading-tight">{creator.name}</h3>
            <p className="text-sm md:text-base text-cobalt-400 font-medium">{creator.title}</p>
            <p className="text-xs leading-tight tracking-wide uppercase font-semibold text-zinc-300">{creator.genre}</p>
            <p className="text-sm leading-snug text-zinc-400">{creator.specialty}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Page Component                              */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [referralCode, setReferralCode] = useState<string | null>(null) // Keep for display if user landed via ref
  const [foundersCount] = useState(33)
  const appMockupsRef = useRef<HTMLDivElement>(null) // Renamed ref for new section
  const [isAppMockupsVisible, setIsAppMockupsVisible] = useState(false) // State for new section
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false) // State for the new dialog

  // Capture referral code from URL and store in localStorage (for initial landing)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const refParam = urlParams.get("ref")

    if (refParam) {
      localStorage.setItem("referralCode", refParam)
      setReferralCode(refParam)
    } else {
      const storedReferralCode = localStorage.getItem("referralCode")
      if (storedReferralCode) {
        setReferralCode(storedReferralCode)
      }
    }
  }, [])

  // Scroll reveal for app mockups
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAppMockupsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (appMockupsRef.current) {
      observer.observe(appMockupsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        // No longer need to remove referralCode from localStorage here,
        // as Beehiiv handles the referral logic internally after subscription.
      } else {
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const creatorsRow1 = creators.slice(0, 4)
  const creatorsRow2 = creators.slice(4, 8)

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 bg-gradient-radial from-zinc-800/20 via-transparent to-black/40" />

        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="mb-6 text-center">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4 relative">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent drop-shadow-2xl flex items-start">
                ArtHouse
                <span className="text-sm md:text-base ml-1 mt-1 text-white/60">™</span>
              </span>
              <div className="absolute inset-0 text-6xl md:text-8xl font-bold tracking-tight blur-xl opacity-30 bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent">
                ArtHouse
              </div>
            </h1>
          </div>

          {/* Tagline */}
          <div className="mb-6 text-center">
            <p className="text-xl md:text-2xl text-zinc-300 font-light tracking-wide animate-fade-in-up">
              Where bold creatives meet.
            </p>
            {referralCode && (
              <p className="text-sm text-zinc-500 mt-2">
                Referred by <span className="text-zinc-300 font-medium">{referralCode}</span>
              </p>
            )}
          </div>

          {/* Email Form (Main) */}
          <div className="w-full max-w-md mx-auto">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-6 py-4 text-lg bg-zinc-900/50 border-zinc-700 rounded-lg backdrop-blur-sm focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 placeholder:text-zinc-500 disabled:opacity-50"
                  />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-semibold bg-white text-black hover:bg-zinc-200 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? "Joining..." : "Request Invite"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Thanks for signing up!</h3>
                  <p className="text-zinc-400">{"Welcome to ArtHouse. Check your inbox for more info."}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continuously Scrolling Creators Carousel */}
      <div className="py-12 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-zinc-200">
            Creators in the Founder's Circle
          </h2>

          <div className="relative space-y-4">
            {/* Row 1 */}
            <div className="flex animate-scroll-row1 space-x-4 md:space-x-8">
              {[...creatorsRow1, ...creatorsRow1, ...creatorsRow1].map((creator, index) => (
                <CreatorCard key={`row1-${index}`} creator={creator} />
              ))}
            </div>
            {/* Row 2 */}
            <div className="flex animate-scroll-row2 space-x-4 md:space-x-8">
              {[...creatorsRow2, ...creatorsRow2, ...creatorsRow2].map((creator, index) => (
                <CreatorCard key={`row2-${index}`} creator={creator} />
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-zinc-500 text-lg">Founding Creator Spots Limited</p>
          </div>
        </div>
      </div>

      {/* New Feature Board Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-zinc-200">
            BUILT FOR CREATIVES. BY CREATIVES.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Curated Onboarding */}
            <div className="flex flex-col items-center p-6 bg-zinc-900/50 rounded-lg border border-zinc-700/50 backdrop-blur-sm justify-between mx-auto w-[70vw] max-w-[256px] h-[104vw] max-h-[416px]">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-white mb-2">Curated Onboarding</h3>
                <p className="text-zinc-400 text-center">
                  Every member is handpicked or verified. No followers. Just professional collaborators.
                </p>
              </div>
              <div className="mt-6 p-3 rounded-full bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center">
                <UserCheck className="w-10 h-10 bg-gradient-to-r from-cobalt-600 to-cobalt-800 bg-clip-text text-transparent" />
              </div>
            </div>
            {/* Feature 2: Swipe by Style */}
            <div className="flex flex-col items-center p-6 bg-zinc-900/50 rounded-lg border border-zinc-700/50 backdrop-blur-sm justify-between mx-auto w-[70vw] max-w-[256px] h-[104vw] max-h-[416px]">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-white mb-2">Swipe by Style</h3>
                <p className="text-zinc-400 text-center">
                  Match with actors, directors, writers, musicians based on genre, portfolio, and vibe.
                </p>
              </div>
              <div className="mt-6 p-3 rounded-full bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center">
                <Hand className="w-10 h-10 bg-gradient-to-r from-cobalt-600 to-cobalt-800 bg-clip-text text-transparent" />
              </div>
            </div>
            {/* Feature 3: Join Collectives */}
            <div className="flex flex-col items-center p-6 bg-zinc-900/50 rounded-lg border border-zinc-700/50 backdrop-blur-sm justify-between mx-auto w-[70vw] max-w-[256px] h-[104vw] max-h-[416px]">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-white mb-2">Join Collectives</h3>
                <p className="text-zinc-400 text-center">
                  Join local or international groups based on shared interests. Create your own communities to build
                  your creative network.
                </p>
              </div>
              <div className="mt-6 p-3 rounded-full bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center">
                <Users className="w-10 h-10 bg-gradient-to-r from-cobalt-600 to-cobalt-800 bg-clip-text text-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section (Updated) */}
      <div className="text-center py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Ready to Join ArtHouse?</h2>
        <p className="text-zinc-400 mb-6">
          Early access is invite-only — we’re curating the future of creative connection.
        </p>
        <a
          onClick={() => setIsEmailDialogOpen(true)} // Open the dialog
          className="inline-block bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white font-medium py-3 px-6 rounded-full transition cursor-pointer shadow-lg hover:shadow-xl"
        >
          Apply Now
        </a>
      </div>

      {/* Floating Founders Circle Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-black border border-zinc-700 rounded-full px-4 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🪩</span>
            <span className="text-white text-sm font-medium">{foundersCount} / 150 Founders Circle Spots Filled</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cobalt-600/20 to-cobalt-800/20 blur-sm -z-10"></div>
        </div>
      </div>

      {/* Footer (Simplified) */}
      <footer className="py-8 px-4">
        <div className="flex justify-center space-x-6 text-sm text-zinc-500">
          <a href="#" className="hover:text-white transition-colors duration-300">
            Privacy
          </a>
          <span>·</span>
          <a href="#" className="hover:text-white transition-colors duration-300">
            Contact
          </a>
        </div>
      </footer>

      {/* Email Dialog Component */}
      <EmailDialog isOpen={isEmailDialogOpen} onClose={() => setIsEmailDialogOpen(false)} />

      <style jsx>{`
        @keyframes scroll-row1 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%); /* Adjusted to cover full width of duplicated content */
          }
        }
        @keyframes scroll-row2 {
          0% {
            transform: translateX(-100%); /* Start from the end to create opposite direction */
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-row1 {
          animation: scroll-row1 30s linear infinite; /* Adjusted speed for more items */
        }
        .animate-scroll-row2 {
          animation: scroll-row2 32s linear infinite; /* Slightly different speed for visual interest */
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.5s both;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .bg-gradient-radial {
          background-image: radial-gradient(50% 50% at 50% 50%, rgba(30, 41, 59, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
        }
      `}</style>
    </div>
  )
}
