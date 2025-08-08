"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setIsAuthLoading(false)
        if (user) {
          // User is already logged in, redirect to home
          router.push("/")
        }
      },
      (error) => {
        console.error("Auth state change error:", error)
        setIsAuthLoading(false)
      },
    )

    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFirebaseConfigured) {
      setError("Authentication service is not configured. Please contact support.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let userCredential

      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        console.log("User created successfully:", userCredential.user.email)
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
        console.log("User signed in successfully:", userCredential.user.email)
      }

      // Store auth state in localStorage for persistence
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", userCredential.user.email || "")

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific Firebase Auth errors
      let errorMessage = "Login failed. Please try again."

      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No account found with this email address."
            break
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again."
            break
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address."
            break
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters long."
            break
          case "auth/email-already-in-use":
            errorMessage = "An account with this email already exists."
            break
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later."
            break
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your connection."
            break
          default:
            if (error.message && error.message.includes("_getRecaptchaConfig")) {
              errorMessage = "Authentication service temporarily unavailable. Please try again."
            } else {
              errorMessage = error.message || "Authentication failed. Please try again."
            }
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render login form if user is already logged in
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="bg-zinc-900/50 border-zinc-700/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {isSignUp ? "Join the ArtHouse community" : "Sign in to your ArtHouse account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@arthousecollective.xyz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !isFirebaseConfigured}
                className="w-full bg-white text-black hover:bg-zinc-200 transition-colors py-3 font-semibold disabled:opacity-50"
              >
                {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            {!isSignUp && (
              <div className="mt-4 text-center">
                <Link
                  href="/apply"
                  className="text-zinc-400 hover:text-white transition-colors text-sm underline underline-offset-4"
                >
                  Don't have an account? Apply to join
                </Link>
              </div>
            )}

            {!isFirebaseConfigured && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-400 text-sm text-center">
                  Authentication service is currently unavailable. Please try again later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
