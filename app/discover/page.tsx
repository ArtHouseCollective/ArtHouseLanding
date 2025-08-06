"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar, Users, ArrowRight, Mail, ShoppingBag, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { RetroNav } from "@/components/retro-nav"
import Image from "next/image"

export default function DiscoverPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleEventSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "events" }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Thanks! You'll be the first to know about events.")
        setEmail("")
      } else {
        setMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const merchItems = [
    {
      id: "arthouse-tee-black",
      name: "ArtHouse Essential Tee",
      price: 45,
      image: "/placeholder.svg?height=400&width=400",
      description: "Premium cotton tee with embroidered ArtHouse logo",
    },
    {
      id: "collective-hoodie",
      name: "Collective Hoodie",
      price: 85,
      image: "/placeholder.svg?height=400&width=400",
      description: "Oversized hoodie in premium fleece",
    },
    {
      id: "director-cap",
      name: "Director's Cap",
      price: 35,
      image: "/placeholder.svg?height=400&width=400",
      description: "Structured cap with ArtHouse embroidery",
    },
  ]

  const featuredArtist = {
    name: "Maya Chen",
    avatar: "/images/creators/ava-williams.jpg",
    quote: "Creating pieces that blur the line between streetwear and cinema.",
    items: [
      {
        id: "maya-film-strip-tee",
        name: "Film Strip Longsleeve",
        price: 65,
        image: "/placeholder.svg?height=400&width=400",
        description: "Limited edition longsleeve designed by Maya Chen",
      },
      {
        id: "maya-viewfinder-hoodie",
        name: "Viewfinder Hoodie",
        price: 95,
        image: "/placeholder.svg?height=400&width=400",
        description: "Exclusive hoodie collaboration with Maya Chen",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Retro Navigation */}
      <RetroNav />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Discover
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Explore ArtHouse events, join creative collectives, and connect with the community that's shaping the future
            of creative collaboration.
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 transition-all duration-300">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-white">Events</CardTitle>
              <p className="text-zinc-400 text-lg">ArtHouse exclusive screenings, meetups, and events. </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-zinc-800/50 rounded-lg p-8 border border-zinc-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Coming Soon</h3>
                <p className="text-zinc-300 mb-6">
                  We're curating exclusive events for the ArtHouse community. From intimate screenings to creative
                  workshops, be the first to know when we launch.
                </p>
                <form onSubmit={handleEventSignup} className="max-w-md mx-auto">
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email for early invites..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="flex-1 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-white focus:ring-1 focus:ring-white"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-white text-black hover:bg-zinc-200 transition-colors px-6 font-semibold"
                    >
                      {isLoading ? "..." : "Notify Me"}
                    </Button>
                  </div>
                  {message && (
                    <p className={`mt-3 text-sm ${message.includes("Thanks") ? "text-green-400" : "text-red-400"}`}>
                      {message}
                    </p>
                  )}
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Collectives Section */}
      <section id="collectives" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 transition-all duration-300">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-white">Collectives</CardTitle>
              <p className="text-zinc-400 text-lg">Communities within ArtHouse — by city, genre, or mission</p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-zinc-800/50 rounded-lg p-8 border border-zinc-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Launching Soon</h3>
                <p className="text-zinc-300 mb-6">Connect with like-minded creators in your area or specialty.</p>
                <div className="space-y-4">
                  <p className="text-zinc-400">Want to host or join a Collective?</p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white font-medium px-6 py-3 rounded-full transition shadow-lg hover:shadow-xl"
                  >
                    <Link href="/apply" className="flex items-center space-x-2">
                      <span>Apply Here</span>
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Merch Section */}
      <section id="merch" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 transition-all duration-300">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-white">Support the Collective</CardTitle>
              <p className="text-zinc-400 text-lg">
                Shop cinematic, limited-run pieces designed by artists in the community.
              </p>
            </CardHeader>
            <CardContent className="space-y-12">
              {/* Core Merch Collection */}
              <div className="bg-zinc-800/30 rounded-2xl p-8 border border-zinc-700/30">
                <h3 className="text-xl font-semibold text-white mb-8 text-center">Core Collection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {merchItems.map((item) => (
                    <div key={item.id} className="group">
                      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl">
                        <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-zinc-800">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="text-white font-medium mb-2">{item.name}</h4>
                        <p className="text-zinc-400 text-sm mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">${item.price}</span>
                          <Button
                            className="bg-white text-black hover:bg-zinc-200 transition-colors text-sm px-4 py-2"
                            data-snipcart-add-to-cart
                            data-item-id={item.id}
                            data-item-price={item.price}
                            data-item-url={`/merch/${item.id}`}
                            data-item-description={item.description}
                            data-item-name={item.name}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Artist Drop */}
              <div className="bg-zinc-800/30 rounded-2xl p-8 border border-zinc-700/30">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <h3 className="text-xl font-semibold text-white">Featured Artist Drop</h3>
                </div>
                <p className="text-zinc-400 text-center mb-8">
                  Exclusive merch created in collaboration with verified ArtHouse creatives.
                </p>

                {/* Artist Info */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-zinc-600">
                    <Image
                      src={featuredArtist.avatar || "/placeholder.svg"}
                      alt={featuredArtist.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-white font-medium text-lg mb-2">{featuredArtist.name}</h4>
                  <p className="text-zinc-300 text-center italic max-w-md">"{featuredArtist.quote}"</p>
                </div>

                {/* Artist Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {featuredArtist.items.map((item) => (
                    <div key={item.id} className="group">
                      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl">
                        <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-zinc-800">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="text-white font-medium mb-2">{item.name}</h4>
                        <p className="text-zinc-400 text-sm mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">${item.price}</span>
                          <Button
                            className="bg-white text-black hover:bg-zinc-200 transition-colors text-sm px-4 py-2"
                            data-snipcart-add-to-cart
                            data-item-id={item.id}
                            data-item-price={item.price}
                            data-item-url={`/merch/${item.id}`}
                            data-item-description={item.description}
                            data-item-name={item.name}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Your Drop CTA */}
                <div className="text-center">
                  <Button
                    className="bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white font-medium px-8 py-3 rounded-full transition shadow-lg hover:shadow-xl border border-zinc-600"
                    disabled
                  >
                    Submit Your Drop (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-zinc-900/30 rounded-2xl p-8 border border-zinc-800">
            <Mail className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Stay in the Loop</h2>
            <p className="text-zinc-400 mb-6">
              Get updates on new features, events, and opportunities as we build the future of creative collaboration.
            </p>
            <Button asChild className="bg-white text-black hover:bg-zinc-200 transition-colors font-semibold px-8 py-3">
              <Link href="/newsletter">Join Newsletter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-white">ArtHouse</h3>
              <p className="text-zinc-400">Where bold creatives meet.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/newsletter" className="text-zinc-400 hover:text-white transition-colors">
                Newsletter
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm">© 2024 ArtHouse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
