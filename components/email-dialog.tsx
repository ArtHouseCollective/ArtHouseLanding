"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
  initialEmail: string
}

export function EmailDialog({ isOpen, onClose, initialEmail }: EmailDialogProps) {
  const [email, setEmail] = useState(initialEmail)
  const [referralEmail, setReferralEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/referralSignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerCode: localStorage.getItem("referralCode"), referredEmail: referralEmail }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send referral.")
      }

      toast({
        title: "Referral Sent!",
        description: "Your friend has been invited to skip the waitlist.",
        className: "bg-green-500 text-white",
      })
      setIsSubmitted(true)
    } catch (error: any) {
      console.error("Error sending referral:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Join the ArtHouse Founders Circle</DialogTitle>
          <DialogDescription className="text-gray-400">
            Invite 3 creatives to skip the waitlist and secure your spot.
          </DialogDescription>
        </DialogHeader>
        {!isSubmitted ? (
          <form onSubmit={handleReferralSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-gray-300">
                Your Email
              </label>
              <Input
                id="email"
                value={email}
                readOnly
                className="col-span-3 bg-gray-800 text-gray-300 border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="referral-email" className="text-right text-gray-300">
                Friend's Email
              </label>
              <Input
                id="referral-email"
                type="email"
                placeholder="friend@example.com"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                required
                className="col-span-3 bg-gray-800 text-white border-gray-700 focus:border-yellow-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Sending Invite..." : "Send Invite"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-green-400 font-semibold mb-4">Invite Sent Successfully!</p>
            <p className="text-gray-300">
              Your friend has been invited. Share your unique referral link to invite more!
            </p>
            {/* You can add the referral link display here if you have it */}
            <Button onClick={onClose} className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
