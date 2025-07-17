"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { CopyIcon } from "lucide-react"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialEmail: string
}

export function EmailDialog({ open, onOpenChange, initialEmail }: EmailDialogProps) {
  const [email, setEmail] = useState(initialEmail)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRequestInvite = async () => {
    setIsLoading(true)
    try {
      // Subscribe to Beehiiv
      const subscribeResponse = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!subscribeResponse.ok) {
        const errorData = await subscribeResponse.json()
        throw new Error(errorData.message || "Failed to subscribe to newsletter.")
      }

      // Generate referral code
      const referralResponse = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!referralResponse.ok) {
        const errorData = await referralResponse.json()
        throw new Error(errorData.message || "Failed to generate referral code.")
      }

      const { referralCode: newReferralCode } = await referralResponse.json()
      setReferralCode(newReferralCode)

      toast({
        title: "Success!",
        description: "You've successfully requested early access. Share your referral code!",
        className: "bg-green-500 text-white",
      })
    } catch (error: any) {
      console.error("Error during invite request:", error)
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
    if (referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`)
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">
            {referralCode ? "Your Early Access Link" : "Request Early Access"}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {referralCode
              ? "Share this link with your friends to help them skip the waitlist!"
              : "Enter your email to join the waitlist and get early access."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3 bg-gray-800 text-white border-gray-700 focus:border-yellow-400"
              disabled={isLoading || !!referralCode}
            />
          </div>
          {referralCode && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="referral-link" className="text-right text-gray-200">
                Link
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Input
                  id="referral-link"
                  value={`${window.location.origin}?ref=${referralCode}`}
                  readOnly
                  className="flex-1 bg-gray-800 text-white border-gray-700"
                />
                <Button
                  type="button"
                  onClick={handleCopyReferralCode}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <CopyIcon className="h-4 w-4 mr-2" /> Copy
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {!referralCode && (
            <Button
              type="submit"
              onClick={handleRequestInvite}
              disabled={isLoading || !email}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {isLoading ? "Requesting..." : "Request Invite"}
            </Button>
          )}
          {referralCode && (
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
