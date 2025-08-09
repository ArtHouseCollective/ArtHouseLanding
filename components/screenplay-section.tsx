"use client"

import React from "react"
import { motion } from "framer-motion"

export default function ScreenplaySection() {
  const dialogue = [
    { who: "INT. BARREN LOS ANGELES HELLSCAPE — DAY", text: "", type: "scene" },
    { who: "JADON", text: "I just feel like the media landscape is full of ads and distracting. There's not really a place to showcase my work and connect with other creatives. If I do find someone's work I like, their DM's are probably flooded, IG will mark my messages as spam, and the stupid algorithm will keep my films buried under clickbait videos of how to make 100 MILLION DOLLARS with one click of an AI program that someone is selling for 3k. I'm just tired of it.", type: "character" },
    { who: "ALSO JADON", text: "...fuck it. I'll just make my own space, where creatives can have a sick portfolio, like a pinterest, but linked to their IMDb, or Spotify, or YouTube, depending on what they do... and they can join Collectives and make groups... and we'll have a matching function for one on one connection, like Bumble but for the arts... and there will be no News Feed.", type: "character" },
    { who: "", text: "(click)", type: "action" },
  ]

  return (
    <section className="relative w-full h-full min-h-screen bg-black text-zinc-100">
      {/* Vignette and paper texture */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/60 to-black" />
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: '140px 140px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 flex flex-col items-center">
        {/* Top-right handwritten marker */}
        <div className="absolute top-6 right-6 text-red-500/80" style={{ fontFamily: 'var(--font-hand)' }}>
          START / SCENE 1
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-zinc-800/80 mb-8" />

        {/* Dialogue block styled like screenplay */}
        <div className="w-full max-w-2xl">
          <div className="font-mono leading-7 text-left">
            {dialogue.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="mb-6"
            >
              {/* Scene heading */}
              {line.type === "scene" && line.who && (
                <div className="display text-red-500 text-xl md:text-3xl mb-4 whitespace-nowrap tracking-widest" style={{ letterSpacing: '0.25em' }}>
                  {line.who}
                </div>
              )}
              
              {/* Character name - centered */}
              {line.type === "character" && line.who && (
                <div className="text-zinc-300 text-sm mb-2 text-center tracking-wide font-bold">
                  {line.who}
                </div>
              )}
              
              {/* Dialogue text - left aligned */}
              {line.type === "character" && line.text && (
                <div className="max-w-prose text-zinc-200 text-left mb-4">
                  {line.text}
                </div>
              )}
              
              {/* Action/description - left aligned, italicized */}
              {line.type === "action" && line.text && (
                <div className="text-zinc-400 italic text-left ml-0">
                  {line.text}
                </div>
              )}
            </motion.div>
          ))}
          </div>
        </div>

        {/* Handwritten prompt to go to the creators carousel */}
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' })}
          className="mt-12 flex items-center gap-3" style={{ fontFamily: 'var(--font-hand)' }}
        >
          <span className="text-red-400 text-2xl md:text-3xl">Discover Collaborators</span>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="opacity-90">
            <path d="M7 8l5 5 5-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Red margin note removed; moved to top-right */}
      </div>
    </section>
  )
}


