"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FullpageScrollProps {
  sections: React.ReactNode[]
  className?: string
}

export default function FullpageScroll({ sections, className = "" }: FullpageScrollProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)

  // Prevent default scroll behavior
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault()
    
    // Disable scroll on body
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const navigateToSection = (sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= sections.length || isScrolling) {
      return
    }
    
    // Determine scroll direction
    setScrollDirection(sectionIndex > currentSection ? 'down' : 'up')
    setIsScrolling(true)
    setCurrentSection(sectionIndex)
    
    // Reset scrolling flag after animation
    setTimeout(() => setIsScrolling(false), 1000)
  }

  // Handle wheel events (desktop)
  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout | null = null
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      if (isScrolling || wheelTimeout) return
      
      // Debounce wheel events to prevent double-scrolling
      wheelTimeout = setTimeout(() => {
        wheelTimeout = null
      }, 50)
      
      const direction = e.deltaY > 0 ? 1 : -1
      navigateToSection(currentSection + direction)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => {
        container.removeEventListener('wheel', handleWheel)
        if (wheelTimeout) clearTimeout(wheelTimeout)
      }
    }
  }, [currentSection, isScrolling, navigateToSection])

  // Handle touch events (mobile)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return
      
      const touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY.current - touchEndY
      
      // Minimum swipe distance
      if (Math.abs(diff) < 50) return
      
      const direction = diff > 0 ? 1 : -1
      navigateToSection(currentSection + direction)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart)
      container.addEventListener('touchend', handleTouchEnd)
      return () => {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [currentSection, isScrolling])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return
      
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault()
          navigateToSection(currentSection + 1)
          break
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          navigateToSection(currentSection - 1)
          break
        case 'Home':
          e.preventDefault()
          navigateToSection(0)
          break
        case 'End':
          e.preventDefault()
          navigateToSection(sections.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSection, isScrolling, sections.length, navigateToSection])

  // Section transition variants (direction-dependent)
  const sectionVariants = {
    enterFromBottom: {
      y: "100%",
      opacity: 0,
    },
    enterFromTop: {
      y: "-100%",
      opacity: 0,
    },
    center: {
      y: "0%",
      opacity: 1,
    },
    exitToTop: {
      y: "-100%",
      opacity: 0,
    },
    exitToBottom: {
      y: "100%",
      opacity: 0,
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSection}
          variants={sectionVariants}
          initial={scrollDirection === 'down' ? "enterFromBottom" : "enterFromTop"}
          animate="center"
          exit={scrollDirection === 'down' ? "exitToTop" : "exitToBottom"}
          transition={{
            type: "tween",
            ease: [0.25, 0.1, 0.25, 1],
            duration: 0.8
          }}
          className="absolute inset-0 w-full h-full"
        >
          {sections[currentSection]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 space-y-3">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => navigateToSection(index)}
            disabled={isScrolling}
            className={`w-3 h-3 rounded-full border border-white/40 transition-all duration-300 hover:scale-125 disabled:cursor-not-allowed ${
              index === currentSection 
                ? 'bg-white' 
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Hint */}
      {currentSection === 0 && (
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div className="flex flex-col items-center text-white/80">
            <span className="mb-2 text-3xl md:text-4xl tracking-widest display" style={{
              fontFamily: 'var(--font-hand)',
              letterSpacing: '0.15em',
              textShadow: '0 1px 0 rgba(0,0,0,0.6)'
            }}>START</span>
            <span className="text-sm md:text-base text-red-400/80" style={{
              fontFamily: 'var(--font-hand)'
            }}>scroll down</span>
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="mt-2"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M7 8l5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}