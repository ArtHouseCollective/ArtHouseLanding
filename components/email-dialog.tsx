"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, Copy, Loader2 } from "lucide-react"

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
  initialEmail: string
  referralCode: string | null
}

export function EmailDialog({ isOpen, onClose, initialEmail, referralCode }: EmailDialogProps) {
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [newReferralCode, setNewReferralCode] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setEmail(initialEmail)
    if (!isOpen) {
      setIsSubmitted(false)
      setNewReferralCode(null)
    }
  }, [isOpen, initialEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/referralSignup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, referralCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to sign up for early access.")
      }

      const data = await response.json()
      setNewReferralCode(data.referralCode)
      setIsSubmitted(true)

      // Also subscribe to Beehiiv
      await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      toast({
        title: "Success!",
        description: "You've successfully requested early access.",
      })
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyReferralCode = () => {
    if (newReferralCode) {
      const referralLink = `${window.location.origin}?ref=${newReferralCode}`
      navigator.clipboard.writeText(referralLink)
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-yellow-500 text-2xl">
            {isSubmitted ? "You're In!" : "Request Early Access"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isSubmitted
              ? "Share your unique referral link with friends to help them skip the waitlist!"
              : "Enter your email below to join the ArtHouse Founders Circle and get early access."}
          </DialogDescription>
        </DialogHeader>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-yellow-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-yellow-500 text-black font-bold hover:bg-yellow-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Apply Now"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-yellow-500 mx-auto" />
            <p className="text-lg font-semibold">Welcome to the Founders Circle!</p>
            {newReferralCode && (
              <div className="flex flex-col gap-2">
                <p className="text-gray-300">Your unique referral link:</p>
                <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-md p-2">
                  <Input
                    type="text"
                    value={`${window.location.origin}?ref=${newReferralCode}`}
                    readOnly
                    className="flex-grow bg-transparent border-none text-white text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyReferralCode}
                    className="text-gray-400 hover:text-yellow-500"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Share this link with 3 friends to help them skip the waitlist!</p>
              </div>
            )}
            <Button
              onClick={onClose}
              className="w-full bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
