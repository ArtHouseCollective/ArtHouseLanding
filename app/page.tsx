"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { EmailDialog } from "@/components/email-dialog"
import Link from "next/link"
import { Menu, X, Settings } from 'lucide-react'
import { useRouter } from "next/navigation"
import { RetroNav } from "@/components/retro-nav"
import FounderCircleCarousel from "@/components/founder-circle-carousel"
import FullpageScroll from "@/components/fullpage-scroll"
import { SmartDashboardLink } from "@/components/smart-dashboard-link"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import CTASection from "@/components/cta-section"
import ScreenplaySection from "@/components/screenplay-section"
import { onAuthStateChanged } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase-client"

// Creators data moved to FounderCircleCarousel component

export default function Page() {
  const [email, setEmail] = useState("")
  const [isSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const router = useRouter()

  // Check authentication state and admin status
  useEffect(() => {
    console.log("🔥 Setting up auth state listener, Firebase configured:", isFirebaseConfigured)

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 Auth state changed:", user?.email || "no user")
      setUser(user)

      if (user && isFirebaseConfigured) {
        console.log("🔥 Checking admin status for:", user.email)
        // Check if user is admin
        try {
          const response = await fetch("/api/check-approval", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email, uid: user.uid }),
          })

          console.log("🔥 Admin check response status:", response.status)

          if (response.ok) {
            const responseText = await response.text()
            console.log("🔥 Admin check response text:", responseText)

            if (responseText) {
              try {
                const data = JSON.parse(responseText)
                console.log("🔥 Admin check data:", data)
                const adminStatus = data.isAdmin || false
                console.log("🔥 Setting admin status to:", adminStatus)
                setIsAdmin(adminStatus)
              } catch (parseError) {
                console.error("❌ Failed to parse admin response:", parseError)
              }
            }
          } else {
            console.error("❌ Admin check failed with status:", response.status)
          }
        } catch (error) {
          console.error("❌ Admin check error:", error)
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



  // Carousel logic moved to FounderCircleCarousel component

  // Define sections for fullpage scroll
  const sections = [
    // Section 1: Hero
    <HeroSection 
      key="hero"
      user={user}
      isAuthLoading={isAuthLoading}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      referralCode={referralCode}
      isFirebaseConfigured={isFirebaseConfigured}
      isAdmin={isAdmin}
      isSubmitted={isSubmitted}
    />,
    
    // Section 2: Screenplay-inspired page
    <ScreenplaySection key="script" />,

    // Section 3: Founder's Circle
    <FounderCircleCarousel key="founders" />,
    
    // Section 4: Features
    <FeaturesSection key="features" user={user} isAuthLoading={isAuthLoading} />,
    
    // Section 5: CTA
    <CTASection 
      key="cta" 
      user={user} 
      isAuthLoading={isAuthLoading} 
      handleApplyClick={handleApplyClick}
    />
  ]

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Fixed Navigation Elements */}
      <RetroNav />

      {/* Admin Button - Only show if Firebase is configured and user is admin */}
      {isFirebaseConfigured && adminCheckComplete && isAdmin && (
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
            <SmartDashboardLink className="block text-2xl font-mono text-white hover:text-zinc-300">
              [ Dashboard ]
            </SmartDashboardLink>
            <Link href="/login" className="block text-2xl font-mono text-white hover:text-zinc-300">
              [ Login ]
            </Link>
            {isFirebaseConfigured && isAdmin && (
              <Link href="/admin/applications" className="block text-2xl font-mono text-red-400 hover:text-red-300">
                [ Admin Panel ]
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Fullpage Scroll Sections */}
      <FullpageScroll sections={sections} />

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
