"use client"

import type React from "react"

import { useState } from "react"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState("")
  const [resetMessage, setResetMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResetMessage("")

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check if user is approved
      try {
        const response = await fetch("/api/check-approval", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        })

        if (response.ok) {
          const responseText = await response.text()
          let data = { isApproved: false }

          if (responseText) {
            try {
              data = JSON.parse(responseText)
            } catch (parseError) {
              console.error("Failed to parse approval response:", parseError)
            }
          }

          if (data.isApproved) {
            // User is approved, redirect to home
            router.push("/")
          } else {
            // User exists but not approved
            setError("Your application is under review. We'll notify you once it's approved.")
            await auth.signOut() // Sign out the user
          }
        } else {
          // API error, but allow login anyway for now
          console.error("Approval check failed, allowing login")
          router.push("/")
        }
      } catch (approvalError) {
        // Network error in approval check, allow login
        console.error("Approval check network error:", approvalError)
        router.push("/")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please check your credentials and try again.")
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.")
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.")
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.")
      return
    }

    setIsResetting(true)
    setError("")
    setResetMessage("")

    try {
      await sendPasswordResetEmail(auth, email)
      setResetMessage("Password reset email sent! Check your inbox.")
    } catch (error: any) {
      console.error("Password reset error:", error)
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.")
      } else {
        setError("Failed to send reset email. Please try again.")
      }
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-zinc-400">Sign in to your ArtHouse account</p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {resetMessage && (
                <Alert className="bg-green-500/10 border-green-500/20">
                  <AlertDescription className="text-green-400">{resetMessage}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResetting}
                className="text-zinc-400 hover:text-white text-sm transition-colors disabled:opacity-50"
              >
                {isResetting ? "Sending..." : "Forgot Password?"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-zinc-400 text-sm">
                Don't have an account?{" "}
                <Link href="/apply" className="text-white hover:underline">
                  Apply to join
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
