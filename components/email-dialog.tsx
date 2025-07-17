"use client"

import type * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EmailDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailDialog({ isOpen, onClose }: EmailDialogProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleClose = () => {
    // Reset state when dialog is closed
    setEmail("")
    setIsSubmitted(false)
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Request Early Access</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Enter your email to join the ArtHouse Founders Circle waitlist.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 text-base bg-zinc-800 border-zinc-700 rounded-md focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 placeholder:text-zinc-500 disabled:opacity-50"
              />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-base font-semibold bg-white text-black hover:bg-zinc-200 transition-all duration-300 rounded-md shadow-lg hover:shadow-xl transform hover:scale-[1.01] disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? "Joining..." : "Request Invite"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Thanks for signing up!</h3>
                <p className="text-zinc-400">{"Welcome to ArtHouse. Check your inbox for more info."}</p>
              </div>
              <Button
                onClick={handleClose}
                className="w-full py-3 text-base font-semibold bg-zinc-700 text-white hover:bg-zinc-600 transition-all duration-300 rounded-md"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
