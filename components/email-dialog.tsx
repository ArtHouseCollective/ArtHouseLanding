"use client"

import { useState, type FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
  initialEmail?: string
}

export function EmailDialog({ isOpen, onClose, initialEmail = "" }: EmailDialogProps) {
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleInviteSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to subscribe.")
      }

      setIsSubmitted(true)
      toast({
        title: "Success!",
        description: "Your invite request has been sent. Check your email for updates!",
        className: "bg-green-500 text-white",
      })
    } catch (error: any) {
      console.error("Error inviting:", error)
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
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Request to Join</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter your email for updates and potential early access!
          </DialogDescription>
        </DialogHeader>
        {!isSubmitted ? (
          <form onSubmit={handleInviteSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="col-span-4 bg-zinc-800 border-zinc-700 text-white focus:border-cobalt-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="bg-cobalt-600 hover:bg-cobalt-700 text-white" disabled={isLoading}>
              {isLoading ? "Sending Invite..." : "Send Invite"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Email Received!</h3>
            <p className="text-zinc-400">Check your inbox to confirm your subscription.</p>
            <Button onClick={onClose} className="mt-6 bg-cobalt-600 hover:bg-cobalt-700 text-white">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
