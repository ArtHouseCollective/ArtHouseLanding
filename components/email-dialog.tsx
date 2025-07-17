"use client"

import { useState, type FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { generateReferralCode } from "@/lib/referral"

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailDialog({ isOpen, onClose }: EmailDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Subscribe to Beehiiv
      const subscribeResponse = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!subscribeResponse.ok) {
        const errorData = await subscribeResponse.json()
        throw new Error(errorData.error || "Failed to subscribe to newsletter.")
      }

      // 2. Generate and store referral code
      const newReferralCode = generateReferralCode(email)
      setReferralCode(newReferralCode)
      localStorage.setItem("referralCode", newReferralCode) // Store for future use

      // 3. Register referral in Firebase
      const referralSignupResponse = await fetch("/api/referralSignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referralCode: newReferralCode }),
      })

      if (!referralSignupResponse.ok) {
        const errorData = await referralSignupResponse.json()
        throw new Error(errorData.error || "Failed to register referral.")
      }

      setIsSubmitted(true)
      toast({
        title: "Application Submitted!",
        description: "Check your email for a confirmation and your unique referral link.",
      })
    } catch (error: any) {
      console.error("Submission error:", error)
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error processing your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyReferral = () => {
    if (referralCode) {
      const referralLink = `${window.location.origin}?ref=${referralCode}`
      navigator.clipboard.writeText(referralLink)
      toast({
        title: "Copied to clipboard!",
        description: "Share your unique link with friends.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Join the ArtHouse Founder's Circle</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter your email to apply for early access and receive your unique referral link.
          </DialogDescription>
        </DialogHeader>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-cobalt-500"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="bg-cobalt-700 hover:bg-cobalt-800 text-white">
              {isLoading ? "Applying..." : "Apply for Early Access"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <h4 className="text-lg font-semibold text-white mb-2">Application Received!</h4>
            <p className="text-zinc-400 mb-4">
              Thank you for your interest in ArtHouse. We'll notify you when your spot is ready.
            </p>
            {referralCode && (
              <div className="mt-4 p-3 bg-zinc-800 rounded-md border border-zinc-700">
                <p className="text-zinc-300 text-sm mb-2">Your unique referral link:</p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={`${window.location.origin}?ref=${referralCode}`}
                    readOnly
                    className="flex-grow bg-zinc-700 border-zinc-600 text-white text-sm"
                  />
                  <Button
                    onClick={handleCopyReferral}
                    variant="outline"
                    size="sm"
                    className="border-cobalt-700 text-cobalt-400 hover:bg-cobalt-900 hover:text-white bg-transparent"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Share this link to invite friends and skip the wait!</p>
              </div>
            )}
            <Button onClick={onClose} className="mt-6 bg-zinc-700 hover:bg-zinc-600 text-white">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
