"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

const creators = [
  {
    name: "Jadon Cal",
    role: "Director",
    genres: "Drama / Surreal",
    works: "Off Rip, Skippin' Town",
    video: null, // Will use image fallback
    image: "/images/creators/JadonCal.jpg",
  },
  {
    name: "Avi Youabian",
    role: "Director",
    genres: "Action / Drama",
    works: "Countdown, FBI International",
    video: null,
    image: "/images/creators/AviYouabian.jpeg",
  },
  {
    name: "Meghan Carrasquillo",
    role: "Actress",
    genres: "Thriller / Horror",
    works: "Stiletto, FOUR",
    video: null,
    image: "/images/creators/meghancarrasquillo2.jpg",
  },
  {
    name: "Ethan Zeitman",
    role: "Sound Department",
    genres: "Action, Horror",
    works: "Fall Guy, Bot or Not",
    video: null,
    image: "/images/creators/ethanz.jpeg",
  },
  {
    name: "Jake Jalbert",
    role: "Cinematographer",
    genres: "Action, Drama",
    works: "DC Down, Off Rip",
    video: null,
    image: "/images/creators/jakejalbert.jpeg",
  },
  {
    name: "John Demari",
    role: "Singer / Actor",
    genres: "Reggae, Drama",
    works: "Beachfly, Florida Wild",
    video: null,
    image: "/images/creators/beachfly.jpeg",
  },
  {
    name: "Lauren Elyse Buckley",
    role: "Actress",
    genres: "Comedy",
    works: "Magnum P.I., Foursome",
    video: null,
    image: "/images/creators/laurenelyse.jpeg",
  },
  {
    name: "Mario Garcia",
    role: "Writer",
    genres: "Comedy",
    works: "The Throwback",
    video: null,
    image: "/images/creators/MarioGarcia.jpg",
  },
]

export default function FounderCircleCarousel() {
  const [currentCount, setCurrentCount] = useState(0)
  const targetCount = 57
  const maxSpots = 150
  const remainingSpots = maxSpots - targetCount

  // Animate counter on mount
  useEffect(() => {
    const duration = 2000 // 2 seconds
    const increment = targetCount / (duration / 16) // 60fps
    let currentValue = 0

    const timer = setInterval(() => {
      currentValue += increment
      if (currentValue >= targetCount) {
        setCurrentCount(targetCount)
        clearInterval(timer)
      } else {
        setCurrentCount(Math.floor(currentValue))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [targetCount])

  // Split creators into two rows
  // Ensure enough cards per row by repeating data if needed
  const baseRow1 = creators.filter((_, i) => i % 2 === 0)
  const baseRow2 = creators.filter((_, i) => i % 2 !== 0)
  const creatorsRow1 = baseRow1.length < 8 ? [...baseRow1, ...baseRow1] : baseRow1
  const creatorsRow2 = baseRow2.length < 8 ? [...baseRow2, ...baseRow2] : baseRow2

  // Creative phrases for background animation
  const creativeWords = [
    "VISIONARY", "CREATOR", "ARTIST", "INNOVATOR", "STORYTELLER", "PIONEER", 
    "DREAMER", "FILMMAKER", "MUSICIAN", "DIRECTOR", "PRODUCER", "WRITER",
    "COMPOSER", "EDITOR", "CURATOR", "FOUNDER", "BUILDER", "MAKER"
  ]

  const shuffleArray = (array: string[], seed: number) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.sin(seed + i) * 10000) % (i + 1)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  return (
    <section id="founders-carousel" className="relative w-full overflow-hidden min-h-screen py-16 bg-black">
      {/* Film grain texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }}
      />
      
      {/* Grungy red/black shadows */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-black to-red-900/40" />
      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900/40 via-transparent to-red-950/20" />
      
      {/* Scrolling Text Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-8">
        {[...Array(12)].map((_, rowIndex) => {
          const shuffledWords = shuffleArray(creativeWords, rowIndex)
          const extendedWords = []
          for (let i = 0; i < 8; i++) {
            extendedWords.push(...shuffledWords)
          }

          return (
            <div
              key={rowIndex}
              className="absolute whitespace-nowrap text-6xl md:text-8xl font-mono font-bold"
              style={{
                top: `${rowIndex * 8}%`,
                left: "0%",
                transform: `rotate(${rowIndex % 2 === 0 ? -1.5 : 1.5}deg)`,
                color: '#404040',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              <div
                className="flex"
                style={{
                  animation: `marquee-background ${(60 + rowIndex * 5) * 5}s linear infinite`,
                  animationDelay: `${rowIndex * -10}s`,
                  animationDirection: rowIndex % 2 === 0 ? "normal" : "reverse",
                }}
              >
                {extendedWords.map((word, index) => (
                  <span
                    key={`row-${rowIndex}-word-${index}`}
                    className="mx-8"
                    style={{
                      color: index % 3 === 0 ? '#dc2626' : '#404040' // Red accent on every 3rd word
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Grungy atmospheric elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-red-900/30 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-red-800/40 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute top-1/2 left-3/4 w-40 h-40 bg-zinc-800/35 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-mono font-bold text-zinc-200 tracking-wider mb-3">
              <span className="text-zinc-200">[ FOUNDER'S </span>
              <span className="text-red-500">CIRCLE </span>
              <span className="text-zinc-200">]</span>
            </h2>
            <p className="text-base font-mono text-zinc-500 tracking-wide">// connecting creators since 2024</p>
          </div>
          <div className="relative bg-zinc-900/60 border border-zinc-700/50 rounded px-4 py-3 font-mono min-w-[180px] backdrop-blur-sm">
            <div className="text-center space-y-2">
              {/* Terminal-style progress */}
              <div className="text-xs text-zinc-400 mb-1">STATUS:</div>
              <div className="flex items-center justify-center space-x-1 text-sm">
                <span className="text-zinc-300">[</span>
                <motion.span 
                  className="text-red-500 font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                >
                  {currentCount}
                </motion.span>
                <span className="text-zinc-500">/</span>
                <span className="text-zinc-400">{maxSpots}</span>
                <span className="text-zinc-300">]</span>
              </div>
              
              {/* Simple ASCII progress bar */}
              <div className="font-mono text-xs text-zinc-500">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentCount / maxSpots) * 100}%` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-red-500 overflow-hidden whitespace-nowrap"
                  style={{ width: `${(currentCount / maxSpots) * 100}%` }}
                >
                  {'█'.repeat(Math.floor((currentCount / maxSpots) * 20))}
                </motion.div>
                <div className="text-zinc-700 -mt-4">
                  {'░'.repeat(20)}
                </div>
              </div>
              
              <div className="text-xs text-zinc-500 tracking-wider">
                ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* Two-Row Carousel */}
        <div className="relative space-y-6">
          {/* Animated light sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <motion.div
              className="absolute w-32 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-12 -translate-x-32"
              animate={{
                x: ["0vw", "100vw"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 12,
                ease: "easeInOut"
              }}
            />
          </div>
          
          {/* Row 1 - Scrolling Left */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: ["0%", "-33.333%"] }}
              transition={{ 
                repeat: Infinity, 
                duration: 40, 
                ease: "linear",
                repeatType: "loop"
              }}
            >
              {[...creatorsRow1, ...creatorsRow1, ...creatorsRow1].map((creator, idx) => (
                <CreatorCard key={`row1-${idx}`} creator={creator} />
              ))}
            </motion.div>
          </div>

          {/* Row 2 - Scrolling Right */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: ["-33.333%", "0%"] }}
              transition={{ 
                repeat: Infinity, 
                duration: 40, 
                ease: "linear",
                repeatType: "loop"
              }}
            >
              {[...creatorsRow2, ...creatorsRow2, ...creatorsRow2].map((creator, idx) => (
                <CreatorCard key={`row2-${idx}`} creator={creator} />
              ))}
            </motion.div>
          </div>

          {/* Edge Fade Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/70 to-transparent z-10" />
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-sm font-mono text-zinc-500 mb-8 tracking-wide">// ready to join?</p>
          <div className="space-y-4">
            <motion.a
              href="/apply"
              className="inline-flex items-center px-8 py-4 border-2 border-red-600 bg-red-600/20 font-mono font-bold text-lg text-red-400 transition-all duration-300 group hover:bg-red-600 hover:text-black hover:border-red-500"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              TAKE YOUR SPOT
              <span className="ml-3 group-hover:translate-x-2 transition-transform duration-200">→</span>
            </motion.a>
            <p className="text-sm font-mono text-zinc-500 tracking-wide">
              Only <span className="text-red-400 font-bold">{remainingSpots}</span> spots left
            </p>
          </div>
        </div>
      </div>

      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white via-transparent to-white pointer-events-none" />
      
      {/* Vignette fade */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/20 via-black/5 to-transparent" />
      </div>
    </section>
  )
}

// Creator Card Component
function CreatorCard({ creator }: { creator: any }) {
  return (
    <div className="relative w-56 md:w-64 flex-shrink-0 overflow-hidden transition-all duration-500 hover:scale-[1.01] group bg-zinc-900/40 border border-zinc-800/50 hover:border-red-600/70">
      {/* Reel Autoplay or Image */}
      <div className="relative w-full h-64 md:h-72 overflow-hidden">
        {creator.video ? (
          <video
            src={creator.video}
            muted
            playsInline
            autoPlay
            loop
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={creator.image}
              alt={creator.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = "/placeholder.png"
              }}
            />
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white font-medium">
                Reel Coming Soon
              </div>
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      {/* Overlay Details */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        <div className="space-y-1">
          <h3 className="text-sm font-mono font-bold text-zinc-200 tracking-wide">{creator.name.toUpperCase()}</h3>
          <p className="text-xs font-mono text-red-400">{creator.role.toLowerCase()}</p>
          <p className="text-xs font-mono text-zinc-500">{creator.genres.toLowerCase()}</p>
          <p className="text-xs font-mono text-zinc-600 opacity-80">"{creator.works.toLowerCase()}"</p>
        </div>
      </div>

      {/* Subtle red glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-red-600/10 mix-blend-multiply" />
        <div className="absolute inset-0 border border-red-600/40" />
      </div>
    </div>
  )
}