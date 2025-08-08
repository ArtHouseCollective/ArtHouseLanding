"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface FeaturesSectionProps {
  user: any
  isAuthLoading: boolean
}

export default function FeaturesSection({ user, isAuthLoading }: FeaturesSectionProps) {
  // Background slideshow images (drop your photos in public/images/dda/ as 1.jpg,2.jpg,...)
  const backgroundImages = [
    "/images/DSC04918-2.JPG",
    "/images/DSC04934.JPG",
    "/images/DSC04973.JPG",
    "/images/DSC05110.JPG",
    "/images/DSC05137.JPG",
    "/images/DSC05195.JPG",
    "/images/DSC05210.2.JPG",
    "/images/DSC05211.JPG",
    "/images/DSC05213.JPG",
    "/images/gasp red carpet.JPG",
  ]

  const [bgIndex, setBgIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % backgroundImages.length)
    }, 5000)
    return () => clearInterval(id)
  }, [backgroundImages.length])
  const features = [
    {
      title: "Curated Onboarding",
      description: "Every member is verified. Professional collaborators only.",
      image: "/assets/icons/cards 2.png"
    },
    {
      title: "Meet your next Collaborator",
      description: "Match with artists based on genre, portfolio, and vibe.",
      image: "/assets/icons/resonance.png"
    },
    {
      title: "Join Collectives",
      description: "Join collectives based on shared interests. Create your own communities to build.",
      image: "/assets/icons/collective.png"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 60,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-20 px-4 bg-black overflow-hidden">
      {/* Kerouac-style faded book background with film grain and slideshow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-900" />
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex}
            className="absolute inset-0 bg-center bg-cover opacity-0"
            style={{ backgroundImage: `url('${encodeURI(backgroundImages[bgIndex])}')` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
        </AnimatePresence>
        {/* Red overlay */}
        <div className="absolute inset-0 bg-red-900/25 mix-blend-multiply" />
        {/* Film grain */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          opacity: 0.2
        }} />
      </div>
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="display uppercase tracking-[0.25em] text-8xl md:text-[11rem] leading-none font-bold text-center mb-4 text-red-500">
            DON'T DO IT ALONE
          </h2>
          <p className="text-zinc-300 mb-2">Your Creative Journey Was Meant To Be Collaborative</p>
          <p>
            <a href={(!isAuthLoading && user) ? "/dashboard" : "/login"} className="text-zinc-400 underline underline-offset-4 hover:text-zinc-300">
              Welcome Home
            </a>
          </p>
          <div className="mb-10" />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="flex flex-col items-center group"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-red-700/20 via-red-600/30 to-red-700/20 rounded-lg blur-xl scale-105 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative flex flex-col items-center justify-center bg-zinc-950/70 rounded-lg border border-zinc-700/50 backdrop-blur-sm mx-auto w-[70vw] max-w-[256px] h-[276px] overflow-hidden group-hover:border-red-600/50 transition-colors duration-300">
                  <div className="relative w-full h-1/2 overflow-hidden saturate-0">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={200}
                      height={138}
                      className="opacity-80 object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 mix-blend-screen"
                      onError={(e) => {
                        console.log("Image failed to load:", e)
                      }}
                    />
                  </div>
                  <div className="flex-none p-6 flex items-center justify-center text-center bg-zinc-900/70 border-t border-red-800/40 w-full h-1/2 group-hover:bg-zinc-900/60 transition-colors duration-300">
                    <p className="text-zinc-200 text-center font-light tracking-wide">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}