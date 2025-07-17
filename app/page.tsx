"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Updated creator data with real photos
const creators = [
  {
    name: "Jadon Cal",
    title: "Director",
    image: "/images/creators/JadonCal.jpg",
    genre: "Drama/Surreal"
    specialty: "Off Rip, Skippin' Town",
  },
  {
    name: "Avi Youabian",
    title: "Director",
    image: "/images/creators/AviYouabian.jpeg",
    genre: "Action/Drama",
    specialty: "Countdown, FBI International",
  },
  {
    name: "Meghan Carrasquillo",
    title: "Actress",
    image: "/images/creators/meghancarrasquillo2.jpg",
    genre: "Thriller/Horror"
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
    title: "Singer, Actor",
    image: "/images/creators/beachfly.jpeg",
    genre: "Reggae, Drama",
    specialty: "Beachfly, Florida Wild",
  },
  {
    name: "Lauren Elyse Buckley",
    title: "Actress",
    image: "/images/creators/laurenelyse.jpeg",
    genre: "Comedy"
    specialty: "Known for: Magnum P.I., Foursome",
  },
  {
    name: "Rhondda Stark Atlas",
    title: "Producer",
    image: "/images/creators/rhondda.jpg",
    genre: "Comedy, Action"
    specialty: "Hacked: A Double Entendre of Rage-Fueled Karma",
  },
]

export default function Page() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [foundersCount] = useState(33)
  const phonePreviewRef = useRef<HTMLDivElement>(null)
  const [isPhoneVisible, setIsPhoneVisible] = useState(false)

  // Capture referral code from URL and store in localStorage
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

  // Scroll reveal for phone mockups
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPhoneVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (phonePreviewRef.current) {
      observer.observe(phonePreviewRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const [beehiivResponse, referralResponse] = await Promise.all([
        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
        fetch("/api/referralSignup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            referredBy: referralCode,
          }),
        }),
      ])

      const beehiivData = await beehiivResponse.json()
      const referralData = await referralResponse.json()

      if (beehiivResponse.ok && referralResponse.ok) {
        setIsSubmitted(true)
        localStorage.removeItem("referralCode")
      } else {
        setError(beehiivData.error || referralData.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 bg-gradient-radial from-zinc-800/20 via-transparent to-black/40" />

        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="mb-12 text-center">
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
          <div className="mb-16 text-center">
            <p className="text-xl md:text-2xl text-zinc-300 font-light tracking-wide animate-fade-in-up">
              Where bold creatives meet.
            </p>
            {referralCode && (
              <p className="text-sm text-zinc-500 mt-2">
                Referred by <span className="text-zinc-300 font-medium">{referralCode}</span>
              </p>
            )}
          </div>

          {/* Email Form */}
          <div className="w-full max-w-md mx-auto">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email for early access..."
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
      <div className="py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-zinc-200">
            Creators in the Founder's Circle
          </h2>

          <div className="relative">
            {/* Continuous scrolling animation */}
            <div className="flex animate-scroll space-x-8">
              {/* First set of creators */}
              {creators.map((creator, index) => (
                <div key={`first-${index}`} className="flex-shrink-0 relative">
                  {/* Golden glow background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 rounded-2xl blur-xl scale-110"></div>

                  {/* Profile card */}
                  <div className="relative bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-8 w-80 h-96 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="w-32 h-32 mb-6 rounded-2xl overflow-hidden">
                        <img
                          src={creator.image || "/placeholder.svg"}
                          alt={creator.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=128&width=128"
                          }}
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{creator.name}</h3>
                      <p className="text-yellow-400 text-lg font-medium mb-2">{creator.title}</p>
                      <p className="text-zinc-300 text-xs tracking-wide uppercase font-semibold mb-1">{creator.genre}</p>
                      <p className="text-zinc-400 text-sm leading-snug">{creator.specialty}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Duplicate set for seamless loop */}
              {creators.map((creator, index) => (
                <div key={`second-${index}`} className="flex-shrink-0 relative">
                  {/* Golden glow background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 rounded-2xl blur-xl scale-110"></div>

                  {/* Profile card */}
                  <div className="relative bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-8 w-80 h-96 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="w-32 h-32 mb-6 rounded-2xl overflow-hidden">
                        <img
                          src={creator.image || "/placeholder.svg"}
                          alt={creator.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=128&width=128"
                          }}
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{creator.name}</h3>
                      <p className="text-yellow-400 text-lg font-medium mb-2">{creator.title}</p>
                      <p className="text-zinc-300 text-xs tracking-wide uppercase font-semibold mb-1">{creator.genre}</p>
                      <p className="text-zinc-400 text-sm leading-snug">{creator.specialty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-zinc-500 text-lg">Scroll the Circle</p>
          </div>
        </div>
      </div>

      {/* Realistic iPhone Mockups Section */}
      <div ref={phonePreviewRef} className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div
            className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 ${
              isPhoneVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Phone 1 - Profile Swipe (Relaxed Mode) */}
            <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-zinc-900 rounded-[2.5rem] p-2 shadow-2xl">
                <div className="bg-black rounded-[2rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-6 py-3 text-white text-sm">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-6 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* App content */}
                  <div className="px-6 pb-8">
                    <h2 className="text-white text-xl font-semibold mb-6">Relaxed Mode</h2>

                    {/* Profile card */}
                    <div className="bg-zinc-800 rounded-3xl p-6 mb-6">
                      <div className="w-full h-64 rounded-2xl mb-4 overflow-hidden">
                        <img
                          src="/images/creators/erin-bennett.jpg"
                          alt="Erin Bennett"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=256&width=200"
                          }}
                        />
                      </div>
                      <h3 className="text-white text-2xl font-bold mb-1">Erin Bennett</h3>
                      <p className="text-zinc-400 text-lg mb-3">Director</p>
                      <div className="flex space-x-2 mb-4">
                        <span className="bg-zinc-700 text-white px-3 py-1 rounded-full text-sm">Surreal</span>
                        <span className="bg-zinc-700 text-white px-3 py-1 rounded-full text-sm">Drama</span>
                        <span className="bg-zinc-700 text-white px-3 py-1 rounded-full text-sm">Dreamlike</span>
                      </div>
                      <div className="text-zinc-300 text-sm">
                        <p className="mb-2">Known for</p>
                        <p className="italic">Nocturnal Mind (2021)</p>
                      </div>
                    </div>

                    {/* Navigation arrows */}
                    <div className="flex justify-between">
                      <button className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">←</span>
                      </button>
                      <button className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone 2 - Hustle Mode / Project */}
            <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="bg-zinc-900 rounded-[2.5rem] p-2 shadow-2xl">
                <div className="bg-black rounded-[2rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-6 py-3 text-white text-sm">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-6 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* App content */}
                  <div className="px-6 pb-8">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-white text-xl font-semibold">Hustle Mode</h2>
                      <div className="bg-blue-500 rounded-full w-12 h-6 flex items-center justify-end pr-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Project card */}
                    <div className="text-center mb-8">
                      <p className="text-zinc-500 text-sm mb-2">FEATURE FILM</p>
                      <h1 className="text-white text-4xl font-serif mb-6 leading-tight">
                        The
                        <br />
                        Vanishing
                        <br />
                        Point
                      </h1>
                      <p className="text-zinc-400 mb-4">Director of Photography</p>
                      <div className="flex justify-center space-x-3 mb-6">
                        <span className="bg-zinc-800 text-white px-3 py-1 rounded-full text-sm">Thriller</span>
                        <span className="bg-zinc-800 text-white px-3 py-1 rounded-full text-sm">Neo-noir</span>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                        Gripping mystery set in rain-soaked city featuring arresting high contrast visuals
                      </p>
                      <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold">SUBMIT</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone 3 - Messaging */}
            <div className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="bg-zinc-900 rounded-[2.5rem] p-2 shadow-2xl">
                <div className="bg-black rounded-[2rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-6 py-3 text-white text-sm">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-6 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* App content */}
                  <div className="px-6 pb-8 h-[600px] flex flex-col">
                    <div className="flex items-center mb-6">
                      <button className="text-white text-xl mr-4">←</button>
                      <h2 className="text-white text-xl font-semibold">Ryder Palmer</h2>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-4 mb-6">
                      <div className="bg-blue-500 rounded-2xl p-4 max-w-[80%] ml-auto">
                        <p className="text-white">Hi Cin. I really like your work.</p>
                      </div>
                      <div className="bg-zinc-800 rounded-2xl p-4 max-w-[80%]">
                        <p className="text-white">I'd love to collaborate on a project if you're available</p>
                      </div>
                    </div>

                    {/* Message input */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-zinc-800 rounded-full px-4 py-3">
                        <input
                          type="text"
                          placeholder="Message..."
                          className="bg-transparent text-white placeholder-zinc-500 w-full outline-none"
                        />
                      </div>
                      <button className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                        <span className="text-white">🎤</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sign up to join the growing community.</h2>
          <p className="text-xl text-zinc-400 mb-8">Refer friends for rewards...</p>
          <Button className="bg-white text-black hover:bg-zinc-200 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
            Invite Friends →
          </Button>
        </div>
      </div>

      {/* Floating Founders Circle Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-black border border-zinc-700 rounded-full px-4 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🪩</span>
            <span className="text-white text-sm font-medium">{foundersCount} / 150 Founders Circle Spots Filled</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 blur-sm -z-10"></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4">
        <div className="flex justify-center space-x-6 text-sm text-zinc-500">
          <a href="#" className="hover:text-white transition-colors duration-300">
            About
          </a>
          <span>·</span>
          <a href="#" className="hover:text-white transition-colors duration-300">
            Privacy
          </a>
          <span>·</span>
          <a href="#" className="hover:text-white transition-colors duration-300">
            Contact
          </a>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
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
