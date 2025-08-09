"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { storySlides } from "@/lib/story-data"

interface StoryViewerProps {
  className?: string
}

export default function StoryViewer({ className = "" }: StoryViewerProps) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const go = (dir: 1 | -1) => {
    setIndex((i) => {
      const next = i + dir
      if (next < 0) return storySlides.length - 1
      if (next >= storySlides.length) return 0
      return next
    })
  }

  // keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // swipe nav
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let startX = 0
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX }
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX
      if (Math.abs(dx) < 40) return
      go(dx < 0 ? 1 : -1)
    }
    el.addEventListener("touchstart", onStart)
    el.addEventListener("touchend", onEnd)
    return () => {
      el.removeEventListener("touchstart", onStart)
      el.removeEventListener("touchend", onEnd)
    }
  }, [])

  const slide = storySlides[index]

  return (
    <section className={`relative w-full h-screen bg-black ${className}`} ref={containerRef}>
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${slide.srcDesktop}')` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        {/* Red glaze & grain */}
        <div className="absolute inset-0 bg-red-900/20 mix-blend-multiply" />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          opacity: 0.2
        }} />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-16">
        <div className="mb-4 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div>[ {index + 1} / {storySlides.length} ]</div>
          <div className="hidden md:block">Use ← → or tap to navigate</div>
        </div>

        <div className="bg-black/50 border border-red-700/40 backdrop-blur-sm p-4 md:p-6 rounded-sm">
          <h3 className="display text-red-500 uppercase tracking-[0.25em] text-lg md:text-2xl mb-2">{slide.title}</h3>
          <p className="text-zinc-200 text-sm md:text-base leading-relaxed">{slide.caption}</p>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            aria-label="Previous"
          >Prev</button>
          <button
            onClick={() => go(1)}
            className="px-4 py-2 border border-red-700 text-red-400 hover:bg-red-700 hover:text-black"
            aria-label="Next"
          >Next</button>
        </div>
      </div>
    </section>
  )
}



