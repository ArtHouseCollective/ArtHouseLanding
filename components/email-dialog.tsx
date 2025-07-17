"use client"

import { useState, type FormEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailDialog({ isOpen, onClose }: EmailDialogProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white">Request Early Access</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Enter your email to join the waitlist for ArtHouse.
          </DialogDescription>
        </DialogHeader>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="col-span-3 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-zinc-200 transition-all duration-300"
            >
              {isLoading ? "Submitting..." : "Join Waitlist"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
            <p className="text-zinc-400">{"We'll notify you when early access is available."}</p>
            <Button onClick={handleCloseDialog} className="w-full bg-white text-black hover:bg-zinc-200">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
