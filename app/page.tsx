"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmailDialog } from "@/components/email-dialog"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { RetroNav } from "@/components/retro-nav"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase-client"

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
    name: "Mario Garcia",
    title: "Writer",
    image: "/images/creators/MarioGarcia.jpg",
    genre: "Comedy",
    specialty: "The Throwback",
  },
  {
    name: "Rhondda Stark Atlas",
    title: "Producer",
    image: "/images/creators/rhondda.jpg",
    genre: "Comedy, Action",
    specialty: "Hacked",
  },
  {
    name: "Yoshi Barrigas",
    title: "Actor",
    image: "/images/creators/yoshi.jpg",
    genre: "Drama, Comedy",
    specialty: "The Chosen",
  },
  {
    name: "Emily Zercher",
    title: "Actress",
    image: "/images/creators/emilyzercher.jpg",
    genre: "Comedy, Action",
    specialty: "Hacked",
  },
  {
    name: "Ethan Daniel Corbett",
    title: "Actor",
    image: "/images/creators/ethan.jpg",
    genre: "Drama, Action",
    specialty: "Faces",
  },
  {
    name: "Julio Gabay",
    title: "Actor",
    image: "/images/creators/julio.jpg",
    genre: "Drama, Action",
    specialty: "Bullet Train",
  },
  {
    name: "Kevin Auger",
    title: "Visual Effects Specialist",
    image: "/images/creators/kevin a.jpg",
    genre: "Drama, Action",
    specialty: "Land of Martyrdom",
  },
  {
    name: "Karsen Schovajsa",
    title: "Actor",
    image: "/images/creators/karsen.jpeg",
    genre: "Horror",
    specialty: "Scorched Earth",
  },
]

interface Creator {
  name: string
  title: string
  image: string
  genre: string
  specialty: string
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="flex-shrink-0 relative w-[70vw] max-w-[256px] h-[104vw] max-h-[416px] mx-2 md:mx-4">
      <div className="absolute inset-0 bg-gradient-to-r from-cobalt-600/20 via-cobalt-700/30 to-cobalt-600/20 rounded-2xl blur-xl scale-110 z-0" />

      <div className="relative z-10 bg-zinc-950/80 border border-zinc-700/50 rounded-2xl p-6 md:p-8 w-full h-full backdrop-blur-sm">
        <div className="flex flex-col items-center text-center h-full space-y-2">
          <div className="w-28 h-36 md:w-32 md:h-40 mb-4 rounded-2xl overflow-hidden">
            <img
              src={creator.image || "/placeholder.png"}
              alt={creator.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = "/placeholder.png"
              }}
            />
          </div>

          <div className="flex flex-col items-center text-center flex-grow justify-evenly">
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

export default function Page() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [foundersCount, setFoundersCount] = useState(50)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const router = useRouter()

  // Check authentication state and admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email)
      setUser(user)

      if (user) {
        console.log("Checking admin status for:", user.email)
        // Check if user is admin
        try {
          const response = await fetch("/api/check-approval", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email, uid: user.uid }),
          })

          console.log("Admin check response status:", response.status)

          if (response.ok) {
            const responseText = await response.text()
            console.log("Admin check response text:", responseText)

            if (responseText) {
              try {
                const data = JSON.parse(responseText)
                console.log("Admin check data:", data)
                const adminStatus = data.isAdmin || false
                console.log("Setting admin status to:", adminStatus)
                setIsAdmin(adminStatus)
              } catch (parseError) {
                console.error("Failed to parse admin response:", parseError)
              }
            }
          } else {
            console.error("Admin check failed with status:", response.status)
          }
        } catch (error) {
          console.error("Admin check error:", error)
        }
      } else {
        setIsAdmin(false)
      }

      setAdminCheckComplete(true)
      setIsAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Capture referral code from URL
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
        // Store email for the application form
        localStorage.setItem("applicationEmail", email)
        // Redirect to application page
        router.push("/apply")
      } else {
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyClick = () => {
    router.push("/apply")
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 100)
  }

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFooterNavigation = (href: string) => {
    router.push(href)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 100)
  }

  const creatorsRow1 = creators.filter((_, i) => i % 2 === 0)
  const creatorsRow2 = creators.filter((_, i) => i % 2 !== 0)

  console.log("Render - isAdmin:", isAdmin, "adminCheckComplete:", adminCheckComplete, "user:", user?.email)

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Retro Navigation */}
      <RetroNav />

      {/* Admin Button - Fixed position with debugging */}
      {adminCheckComplete && isAdmin && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => router.push("/admin/applications")}
            className="bg-red-600 hover:bg-red-700 text-white border border-red-500 shadow-lg backdrop-blur-sm"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      )}

      {/* Debug info - remove this after testing */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-20 left-4 z-50 bg-black/80 text-white p-2 text-xs rounded">
          <div>User: {user?.email || "None"}</div>
          <div>Admin: {isAdmin ? "Yes" : "No"}</div>
          <div>Check Complete: {adminCheckComplete ? "Yes" : "No"}</div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-zinc-800"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/95 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center space-y-8">
            <Link href="/discover" className="block text-2xl font-mono text-white hover:text-zinc-300">
              [ Discover ]
            </Link>
            <Link href="/newsletter" className="block text-2xl font-mono text-white hover:text-zinc-300">
              [ Newsletter ]
            </Link>
            <Link href="/contact" className="block text-2xl font-mono text-white hover:text-zinc-300">
              [ Contact ]
            </Link>
            {!user && (
              <Link href="/apply" className="block text-2xl font-mono text-white hover:text-zinc-300">
                [ Apply ]
              </Link>
            )}
            <Link href="/login" className="block text-2xl font-mono text-white hover:text-zinc-300">
              [ Login ]
            </Link>
            {isAdmin && (
              <Link href="/admin/applications" className="block text-2xl font-mono text-red-400 hover:text-red-300">
                [ Admin Panel ]
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 bg-gradient-radial from-zinc-800/20 via-transparent to-black/40" />

        <div className="relative z-10 flex flex-col items-center justify-center">
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

          {/* Only show email form if user is not logged in */}
          {!isAuthLoading && !user && (
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
                    {isLoading ? "Processing..." : "Request Access"}
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
          )}

          {/* Show welcome message if user is logged in */}
          {user && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Welcome back!</h3>
                <p className="text-zinc-400">You're logged in as {user.email}</p>
                {isAdmin && <p className="text-red-400 text-sm mt-2 font-medium">Admin Access Enabled</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creators Carousel */}
      <div className="py-12 overflow-hidden w-screen">
        <div className="px-4 max-w-6xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-200">Creators in the Founder's Circle</h2>
        </div>

        <div className="relative space-y-4">
          <div className="w-full overflow-hidden relative">
            <div className="flex animate-scroll-row1 whitespace-nowrap">
              {[...creatorsRow1, ...creatorsRow1, ...creatorsRow1].map((creator, index) => (
                <CreatorCard key={`row1-${index}`} creator={creator} />
              ))}
            </div>
          </div>
          <div className="w-full overflow-hidden relative">
            <div className="flex animate-scroll-row2 whitespace-nowrap">
              {[...creatorsRow2, ...creatorsRow2, ...creatorsRow2].map((creator, index) => (
                <CreatorCard key={`row2-${index}`} creator={creator} />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-10 px-4">
          <p className="text-zinc-500 text-lg">Founding Creator Spots Limited</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-zinc-200">
            BUILT FOR CREATIVES.
            <br />
            BY CREATIVES.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-white mb-4">Curated Onboarding</h3>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-cobalt-600/20 via-cobalt-700/30 to-cobalt-600/20 rounded-lg blur-xl scale-105"></div>
                <div className="relative flex flex-col items-center justify-center bg-zinc-950/70 rounded-lg border border-zinc-700/50 backdrop-blur-sm mx-auto w-[70vw] max-w-[256px] h-[276px] overflow-hidden">
                  <div className="relative w-full h-1/2 flex items-center justify-center overflow-hidden p-4">
                    <Image
                      src="/assets/icons/cards 2.png"
                      alt="Curated Onboarding"
                      fill
                      style={{ objectFit: "cover" }}
                      className="opacity-80"
                    />
                  </div>
                  <div className="flex-none p-6 flex items-center justify-center text-center bg-zinc-900/70 border-t border-zinc-700 w-full h-1/2">
                    <p className="text-white text-center font-light tracking-wide">
                      Every member is verified. Professional collaborators only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-white mb-4">Meet your next Collaborator</h3>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-cobalt-600/20 via-cobalt-700/30 to-cobalt-600/20 rounded-lg blur-xl scale-105"></div>
                <div className="relative flex flex-col items-center justify-center bg-zinc-950/70 rounded-lg border border-zinc-700/50 backdrop-blur-sm mx-auto w-[70vw] max-w-[256px] h-[276px] overflow-hidden">
                  <div className="relative w-full h-1/2 flex items-center justify-center overflow-hidden p-4">
                    <Image
                      src="/assets/icons/resonance.png"
                      alt="Swipe by Style"
                      fill
                      style={{ objectFit: "cover" }}
                      className="opacity-80"
                    />
                  </div>
                  <div className="flex-none p-6 flex items-center justify-center text-center bg-zinc-900/70 border-t border-zinc-700 w-full h-1/2">
                    <p className="text-white text-center font-light tracking-wide">
                      Match with artists based on genre, portfolio, and vibe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-white mb-4">Join Collectives</h3>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-cobalt-600/20 via-cobalt-700/30 to-cobalt-600/20 rounded-lg blur-xl scale-105"></div>
                <div className="relative flex flex-col items-center justify-center bg-zinc-950/70 rounded-lg border border-zinc-700/50 backdrop-blur-sm mx-auto w-[70vw] max-w-[256px] h-[276px] overflow-hidden">
                  <div className="relative w-full h-1/2 flex items-center justify-center overflow-hidden p-4">
                    <Image
                      src="/assets/icons/collective.png"
                      alt="Join Collectives"
                      fill
                      style={{ objectFit: "cover" }}
                      className="opacity-80"
                    />
                  </div>
                  <div className="flex-none p-6 flex items-center justify-center text-center bg-zinc-900/70 border-t border-zinc-700 w-full h-1/2">
                    <p className="text-white text-center font-light tracking-wide">
                      Join collectives based on shared interests. Create your own communities to build.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Only show if user is not logged in */}
      {!isAuthLoading && !user && (
        <div className="text-center py-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Ready to Join ArtHouse?</h2>
          <p className="text-zinc-400 mb-6">
            Early access is invite-only. We're curating the future of creative connection.
          </p>
          <Button
            onClick={handleApplyClick}
            className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white font-medium py-3 px-6 rounded-full transition shadow-lg hover:shadow-xl"
          >
            Apply Now
          </Button>
        </div>
      )}

      {/* Founders Circle Badge - Fixed positioning for mobile */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
        <div className="bg-black border border-zinc-700 rounded-full px-4 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🪩</span>
            <span className="text-white text-sm font-medium">57 / 150 Founder's Circle Spots Filled</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cobalt-600/20 to-cobalt-800/20 blur-sm -z-10"></div>
        </div>
      </div>

      {/* Updated Footer */}
      <footer className="border-t border-zinc-800 py-12 px-4 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 cursor-pointer" onClick={handleHomeClick}>
              <h3 className="text-2xl font-bold text-white hover:text-zinc-300 transition-colors">ArtHouse</h3>
              <p className="text-zinc-400">Where bold creatives meet.</p>
            </div>
            <div className="flex space-x-6">
              <button
                onClick={() => handleFooterNavigation("/newsletter")}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Newsletter
              </button>
              <button
                onClick={() => handleFooterNavigation("/privacy")}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => handleFooterNavigation("/contact")}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm">© 2024 ArtHouse. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <EmailDialog isOpen={isEmailDialogOpen} onClose={() => setIsEmailDialogOpen(false)} />

      <style jsx>{`
        @keyframes scroll-row1 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        @keyframes scroll-row2 {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-row1 {
          animation: scroll-row1 30s linear infinite;
        }
        .animate-scroll-row2 {
          animation: scroll-row2 30s linear infinite;
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
