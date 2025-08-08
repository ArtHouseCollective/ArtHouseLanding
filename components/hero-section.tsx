"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// center nav removed; no extra imports needed

interface HeroSectionProps {
  user: any
  isAuthLoading: boolean
  email: string
  setEmail: (email: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  error: string
  referralCode: string | null
  isFirebaseConfigured: boolean
  isAdmin: boolean
  isSubmitted: boolean
}

export default function HeroSection({
  user,
  isAuthLoading,
  email,
  setEmail,
  handleSubmit,
  isLoading,
  error,
  referralCode,
  isFirebaseConfigured,
  isAdmin,
  isSubmitted,
}: HeroSectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background image with dark vignette for album-cover feel */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center opacity-60" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        {/* Film grain */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '150px 150px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div 
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="display text-8xl md:text-[11rem] leading-none font-bold tracking-tight mb-3 relative text-red-600">
            ARTHOUSE
          </h1>
          <div className="display uppercase text-xl md:text-3xl tracking-[0.3em] text-red-500">
            CREATIVE COLLECTIVE
          </div>
        </motion.div>

        <motion.div 
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Center nav removed (kept marquee nav at top) */}
          {referralCode && (
            <p className="text-sm text-zinc-500 mt-2">
              Referred by <span className="text-zinc-300 font-medium">{referralCode}</span>
            </p>
          )}
        </motion.div>

        {/* Only show email form if user is not logged in */}
        {!isAuthLoading && !user && (
          <motion.div 
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-6 py-4 text-lg bg-black/60 border-red-700 text-red-200 rounded-none backdrop-blur-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300 placeholder:text-red-600 disabled:opacity-50"
                  />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-bold bg-red-600 text-black hover:bg-red-500 transition-all duration-300 rounded-none border-2 border-red-500 tracking-wider"
                >
                  {isLoading ? "Processing..." : "TAKE YOUR SPOT"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Thanks for signing up!</h3>
                  <p className="text-zinc-400">{"Welcome to ArtHouse. Check your inbox for more info."}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Show welcome message if user is logged in */}
        {user && isFirebaseConfigured && (
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Welcome back!</h3>
              <p className="text-zinc-400">You're logged in as {user.email}</p>
              {isAdmin && <p className="text-red-400 text-sm mt-2 font-medium">Admin Access Enabled</p>}
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background-image: radial-gradient(50% 50% at 50% 50%, rgba(30, 41, 59, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
        }
      `}</style>

      {/* Removed bottom logo per design direction */}
    </div>
  )
}