"use client"

import { useState, type FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailDialog({ isOpen, onClose }: EmailDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

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
        setIsSubmitted(true)
      } else {
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setEmail("")
    setIsSubmitted(false)
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-cobalt-400">Join the ArtHouse Waitlist</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter your email to request early access and be notified when we launch.
          </DialogDescription>
        </DialogHeader>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="col-span-3 bg-zinc-900/50 border-zinc-700 text-white focus:border-cobalt-400 focus:ring-cobalt-400"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cobalt-600 hover:bg-cobalt-700 text-white font-semibold"
            >
              {isLoading ? "Submitting..." : "Request Early Access"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-cobalt-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">You're on the list!</h4>
            <p className="text-zinc-400">Thanks for your interest in ArtHouse. We'll notify you when we're ready.</p>
            <Button onClick={handleCloseDialog} className="mt-6 bg-cobalt-600 hover:bg-cobalt-700 text-white">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
