"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { EmailDialog } from "@/components/email-dialog"
import { FOUNDERS_CIRCLE_CAP, FOUNDERS_CIRCLE_FILLED } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [email, setEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const foundersCircleProgress = (FOUNDERS_CIRCLE_FILLED / FOUNDERS_CIRCLE_CAP) * 100

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to subscribe.")
      }

      toast({
        title: "Success!",
        description: "You've been added to the waitlist. Check your email for updates!",
        className: "bg-green-500 text-white",
      })
      setIsDialogOpen(true)
    } catch (error: any) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const creators = [
    { name: "Avi Youabian", role: "Filmmaker", image: "/images/creators/AviYouabian.jpeg" },
    { name: "Jadon Cal", role: "Actor", image: "/images/creators/JadonCal.jpg" },
    { name: "Ava Williams", role: "Writer", image: "/images/creators/ava-williams.jpg" },
    { name: "Beachfly", role: "Musician", image: "/images/creators/beachfly.jpeg" },
    { name: "Ethan Z", role: "Photographer", image: "/images/creators/ethanz.jpeg" },
    { name: "Jake Jalbert", role: "Designer", image: "/images/creators/jakejalbert.jpeg" },
    { name: "Lauren Elyse", role: "Dancer", image: "/images/creators/laurenelyse.jpeg" },
    { name: "Meghan Carrasquillo", role: "Painter", image: "/images/creators/meghancarrasquillo.jpeg" },
    { name: "Rhondda", role: "Sculptor", image: "/images/creators/rhondda.jpg" },
  ]

  const features = [
    {
      title: "Curated Onboarding",
      description: "Every profile is reviewed by a human. No bots, no spam, no noise. Just real creatives.",
      image: "/assets/icons/icon cards ppl.png",
      type: "logo",
    },
    {
      title: "Style-based Matching",
      description: "Our algorithm connects you with collaborators based on creative style, not followers.",
      image: "/assets/icons/resonance.png",
      type: "logo",
    },
    {
      title: "Built for Craft, Not Clout",
      description:
        "ArtHouse gives creatives a place to be seen — not scrolled past. We focus on your work, not your follower count.",
      type: "text",
    },
    {
      title: "A Collective, Not a Network",
      description: "Find your next collaborator, mentor, or creative partner. Build meaningful relationships.",
      type: "text",
    },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-black text-white">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Image src="/placeholder-logo.png" alt="ArtHouse Logo" width={120} height={40} />
          <span className="sr-only">ArtHouse</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            About
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center justify-center text-center bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
          <div className="container px-4 md:px-6 z-10">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none text-yellow-400 drop-shadow-lg">
                ArtHouse
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                Where bold creatives meet. Enter your email to request early access.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="max-w-lg flex-1 bg-gray-800 text-white border-gray-700 focus:border-yellow-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Requesting..." : "Request Invite"}
                </Button>
              </form>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            {FOUNDERS_CIRCLE_FILLED} / {FOUNDERS_CIRCLE_CAP} Founders Circle Spots Filled
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-950 text-white overflow-hidden">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-yellow-400">
              Creators Already On ArtHouse
            </h2>
            <div className="relative w-full overflow-hidden">
              <div className="flex whitespace-nowrap scrolling-carousel">
                {Array(2)
                  .fill(null)
                  .map((_, carouselIndex) => (
                    <div key={carouselIndex} className="flex">
                      {creators.map((creator, index) => (
                        <Card
                          key={index}
                          className="inline-block w-[200px] h-[250px] mx-4 bg-gray-900 text-white rounded-lg overflow-hidden shadow-lg flex-shrink-0"
                        >
                          <CardContent className="p-0 h-full flex flex-col items-center justify-center">
                            <div className="relative w-full h-3/4">
                              <Image
                                src={creator.image || "/placeholder.svg"}
                                alt={creator.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-t-lg"
                              />
                            </div>
                            <div className="p-4 text-center w-full">
                              <h3 className="text-lg font-semibold">{creator.name}</h3>
                              <p className="text-sm text-gray-400">{creator.role}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
            <p className="text-center text-gray-400 mt-8 text-sm">Scroll the Circle</p>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400">{feature.title}</h3>
                  <Card className="w-full h-[230px] relative overflow-hidden rounded-lg shadow-lg bg-zinc-950 border border-zinc-600">
                    <CardContent className="relative z-10 flex flex-col h-full p-0">
                      {feature.type === "logo" && feature.image ? (
                        <div className="flex-grow flex items-center justify-center p-4">
                          <Image
                            src={feature.image || "/placeholder.svg"}
                            alt={feature.title}
                            width={96} // Increased size
                            height={96} // Increased size
                            objectFit="contain"
                            className="opacity-80" // Increased opacity
                          />
                        </div>
                      ) : (
                        <div className="flex-grow flex items-center justify-center p-4">
                          <span className="sr-only">{feature.description}</span>
                        </div>
                      )}
                      <div className="flex-shrink-0 p-6 flex items-center justify-center text-center bg-zinc-900/70 border-t border-zinc-700">
                        <p className="text-white text-base">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-950 text-white flex flex-col items-center justify-center text-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-yellow-400 mb-6">
              This only works if it's ours.
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl mb-8">Invite 3 creatives to skip the wait.</p>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              onClick={() => setIsDialogOpen(true)}
            >
              Invite Friends
            </Button>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800 bg-black text-gray-400">
        <p className="text-xs">&copy; 2024 ArtHouse. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
      <EmailDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} initialEmail={email} />
    </div>
  )
}
