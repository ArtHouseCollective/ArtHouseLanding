"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function MerchPage() {
  const [isPaused, setIsPaused] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    portfolio: "",
    description: "",
  })

  const phrases = [
    "Limited Edition",
    "Community Designs",
    "Creators First",
    "Dream Big",
    "Designed To Create",
    "Follow Through",
    "Rep Your Art",
  ]

  // Create different shuffled arrays for each row
  const shuffleArray = (array: string[], seed: number) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.sin(seed + i) * 10000) % (i + 1)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Partnership application:", formData)
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Text Rows */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        {[...Array(8)].map((_, rowIndex) => {
          const shuffledPhrases = shuffleArray(phrases, rowIndex)
          const extendedPhrases = []
          for (let i = 0; i < 5; i++) {
            extendedPhrases.push(...shuffledPhrases)
          }

          return (
            <div
              key={rowIndex}
              className="flex whitespace-nowrap"
              style={{
                transform: `translateY(${rowIndex * 56}px)`,
              }}
            >
              <div
                className="flex"
                style={{
                  animation: `marquee-continuous 58s linear infinite`,
                  animationDelay: `${rowIndex * -3}s`,
                }}
              >
                {extendedPhrases.map((phrase, index) => (
                  <span
                    key={`row-${rowIndex}-phrase-${index}`}
                    className="text-white font-mono text-lg tracking-wider mr-16 flex-shrink-0"
                  >
                    [ {phrase} ]
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrolling Text Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800">
        <div
          className="overflow-hidden whitespace-nowrap"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="inline-flex items-center space-x-8 py-4 px-4 font-mono text-sm tracking-wider animate-marquee"
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {[...phrases, ...phrases, ...phrases].map((phrase, index) => (
              <span key={`top-bar-${index}`} className="text-white">
                [ {phrase} ]
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* Product Section - Centered */}
          <div className="flex justify-center mb-24">
            <div className="text-center max-w-md">
              {/* Product Image - No Box */}
              <div className="mb-8">
                <div className="w-64 h-64 mx-auto mb-4 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <img 
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ah%20wb%20vector-PtME8rmSZ5YLtO8VYJhccqEv8LPZth.png" 
                      alt="ArtHouse Logo" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Product Info - Retro Style */}
              <div className="space-y-4">
                <h3 className="text-2xl font-mono tracking-wider font-bold whitespace-nowrap">
                  [ FOUNDER'S TEE ]
                </h3>
                <p className="text-zinc-400 font-mono text-sm tracking-wide">PREMIUM COTTON • DESIGNED FOR THE VISIONARIES   </p>
                <p className="text-red-400 font-mono text-xs tracking-wide">LIMITED EDITION • EXPIRES 11/11</p>

                <div className="my-6">
                  <span className="text-4xl font-mono font-bold tracking-wider">$75</span>
                </div>

                <Button
                  className="bg-white text-black hover:bg-zinc-200 font-mono tracking-wider px-8 py-3 text-lg"
                  data-snipcart-add-to-cart
                  data-item-id="arthouse-essential-tee"
                  data-item-price="35.00"
                  data-item-url="/merch"
                  data-item-description="Premium cotton tee featuring the ArtHouse logo"
                  data-item-name="ArtHouse Essential Tee"
                >
                  [ ADD TO CART ]
                </Button>
              </div>
            </div>
          </div>

          {/* Partnership Form - Solid Background */}
          <div className="bg-black relative z-20 py-16">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4 font-mono">Collaborate on the Next Drop.   </h2>
                <p className="text-zinc-400 font-mono">We partner with select creators to launch limited-run collections. Tell us your vision.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-zinc-900 border-zinc-700"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-zinc-900 border-zinc-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Input
                    name="portfolio"
                    type="url"
                    placeholder="Portfolio URL"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>

                <div>
                  <Textarea
                    name="description"
                    placeholder="Start a conversation for a paid opportunity..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-zinc-900 border-zinc-700"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200">
                  Apply to Partner
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-continuous {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
