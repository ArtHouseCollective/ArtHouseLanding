"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface CTASectionProps {
  user: any
  isAuthLoading: boolean
  handleApplyClick: () => void
}

export default function CTASection({ user, isAuthLoading, handleApplyClick }: CTASectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative bg-gradient-to-t from-black via-zinc-950 to-black">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-black to-zinc-900/50" />
      
      <motion.div 
        className="relative z-10 text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <motion.h2 
          className="display uppercase tracking-[0.25em] text-4xl md:text-6xl font-bold text-red-500 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          READY TO JOIN ARTHOUSE?
        </motion.h2>
        
        <motion.p 
          className="text-xl md:text-2xl text-zinc-300 mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          No feeds. No noise. Just collaborators, collectives, and your work—front and center.
        </motion.p>

        {/* Only show CTA if user is not logged in */}
        {!isAuthLoading && !user && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={handleApplyClick}
                className="border-2 border-red-600 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-black hover:border-red-500 font-bold py-4 px-8 text-lg rounded-none transition-all duration-300 shadow-lg hover:shadow-red-900/40"
              >
                TAKE YOUR SPOT
              </Button>
              <a href="#founders-carousel" className="text-sm text-red-400 underline underline-offset-4">See who’s already in</a>
            </div>
          </motion.div>
        )}

        {/* Show different message if user is logged in */}
        {user && (
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
              <h3 className="text-2xl font-semibold text-white mb-2">You're all set!</h3>
              <p className="text-zinc-300 text-lg">Welcome to the ArtHouse community.</p>
            </div>
          </motion.div>
        )}

        {/* Founders Circle Badge */}
        <motion.div 
          className="mt-12 inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="bg-black/50 border border-red-700 rounded-full px-6 py-3 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🪩</span>
              <span className="text-red-400 text-lg font-medium">57 / 150 Founder's Circle Spots Filled</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-700/20 to-red-800/20 blur-sm -z-10"></div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}