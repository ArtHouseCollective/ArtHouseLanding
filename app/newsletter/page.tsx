"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ExternalLinkDialog } from "@/components/external-link-dialog"
import Link from "next/link"

interface NewsletterPost {
  id: string
  title: string
  subtitle?: string
  content_preview?: string
  publish_date: string
  created: string
  updated: string
  web_url: string
  thumbnail_url?: string
}

interface NewsletterResponse {
  data: NewsletterPost[]
  total_results: number
}

// Manual date mapping for newsletter posts - using multiple variations
const POST_DATES: Record<string, string> = {
  "arthouse update we're almost there": "June 26, 2025",
  "arthouse update were almost there": "June 26, 2025",
  "arthouse update - we're almost there": "June 26, 2025",
  "arthouse update: we're almost there": "June 26, 2025",
  "arthouse insider issue 2": "July 14, 2025",
  "arthouse insider - issue 2": "July 14, 2025",
  "arthouse insider: issue 2": "July 14, 2025",
}

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [posts, setPosts] = useState<NewsletterPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<NewsletterPost | null>(null)
  const { toast } = useToast()

  // Fetch newsletter posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/newsletter-posts")
        if (!response.ok) {
          const errorData = await response.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.error || "Failed to fetch posts")
        }
        const data: NewsletterResponse = await response.json()
        console.log("Received posts data:", data)
        setPosts(data.data || [])
      } catch (error) {
        console.error("Error fetching posts:", error)
        setPostsError(error instanceof Error ? error.message : "Unable to load newsletter posts")
      } finally {
        setPostsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setEmail("")
        toast({
          title: "Success!",
          description: "You've been added to the ArtHouse newsletter.",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostClick = (post: NewsletterPost) => {
    setSelectedPost(post)
    setDialogOpen(true)
  }

  const handleConfirmNavigation = () => {
    if (selectedPost) {
      window.open(selectedPost.web_url, "_blank", "noopener,noreferrer")
    }
    setDialogOpen(false)
    setSelectedPost(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedPost(null)
  }

  const formatDate = (post: NewsletterPost) => {
    // Normalize the title for matching
    const normalizeTitle = (title: string) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/['']/g, "'") // Normalize apostrophes
        .replace(/[""]/g, '"') // Normalize quotes
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/[^\w\s']/g, "") // Remove special characters except apostrophes
    }

    const normalizedTitle = normalizeTitle(post.title)
    console.log("Original title:", post.title)
    console.log("Normalized title:", normalizedTitle)

    // Check for manual date mapping
    for (const [key, date] of Object.entries(POST_DATES)) {
      const normalizedKey = normalizeTitle(key)
      console.log("Checking against:", normalizedKey)

      if (normalizedTitle.includes(normalizedKey) || normalizedKey.includes(normalizedTitle)) {
        console.log("Found manual date match:", date)
        return date
      }
    }

    // Special case matching for common variations
    if (normalizedTitle.includes("arthouse update") && normalizedTitle.includes("almost")) {
      console.log("Using special case for ArtHouse update")
      return "June 26, 2025"
    }

    if (normalizedTitle.includes("arthouse insider") && normalizedTitle.includes("2")) {
      console.log("Using special case for ArtHouse insider issue 2")
      return "July 14, 2025"
    }

    // Fallback to API date parsing
    const dateString = post.publish_date || post.created || post.updated
    console.log("Trying to parse API date:", dateString)

    if (!dateString) {
      console.log("No date string available")
      return "Recent"
    }

    // Try different date parsing approaches
    let date: Date | null = null

    // First, try parsing as-is
    try {
      date = new Date(dateString)
      if (!isNaN(date.getTime()) && date.getFullYear() >= 2020) {
        console.log("Successfully parsed date:", date)
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    } catch (e) {
      console.log("Failed to parse as regular date")
    }

    // Try parsing as timestamp
    try {
      const timestamp = Number.parseInt(dateString)
      if (!isNaN(timestamp)) {
        // Try both seconds and milliseconds
        date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000)
        if (!isNaN(date.getTime()) && date.getFullYear() >= 2020) {
          console.log("Successfully parsed timestamp:", date)
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }
      }
    } catch (e) {
      console.log("Failed to parse as timestamp")
    }

    // Try ISO format variations
    try {
      const isoDate = dateString.replace(/\s/, "T")
      date = new Date(isoDate)
      if (!isNaN(date.getTime()) && date.getFullYear() >= 2020) {
        console.log("Successfully parsed ISO date:", date)
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    } catch (e) {
      console.log("Failed to parse as ISO date")
    }

    console.log("All date parsing failed, using fallback")
    return "Recent"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="p-6">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to ArtHouse
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Be The First To Know.</h1>
          <p className="text-xl text-zinc-400 font-light mb-8">
            Stay up to date with ArtHouse as we grow the collective.
          </p>

          {/* Subscription Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-6 py-4 text-lg bg-zinc-900/50 border-zinc-700 rounded-lg backdrop-blur-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all duration-300 placeholder:text-zinc-500 disabled:opacity-50"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-fade-in max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to ArtHouse!</h3>
                <p className="text-zinc-400">Check your inbox for your first newsletter.</p>
              </div>
            </div>
          )}
        </div>

        {/* Newsletter Posts Section */}
        <div className="border-t border-zinc-800 pt-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Recent Newsletter Issues</h2>

          {postsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <span className="ml-3 text-zinc-400">Loading newsletter posts...</span>
            </div>
          ) : postsError ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 mb-4">{postsError}</p>
              <p className="text-sm text-zinc-500">Subscribe to get the latest updates delivered to your inbox.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 mb-4">No newsletter posts available yet.</p>
              <p className="text-sm text-zinc-500">Be the first to know when we publish our first issue!</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  {post.thumbnail_url && (
                    <div className="aspect-video bg-zinc-800">
                      <img
                        src={post.thumbnail_url || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-yellow-500 mb-2">{formatDate(post)}</div>
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
                    {post.subtitle && <p className="text-zinc-400 mb-3 line-clamp-2">{post.subtitle}</p>}
                    {post.content_preview && (
                      <p className="text-zinc-500 text-sm mb-4 line-clamp-3">{post.content_preview}</p>
                    )}
                    <div className="inline-flex items-center text-yellow-500 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium">
                      Read Full Article
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* External Link Dialog */}
      <ExternalLinkDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmNavigation}
        url={selectedPost?.web_url || ""}
        title={selectedPost?.title || ""}
      />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800 mt-16">
        <div className="flex justify-center space-x-6 text-sm text-zinc-500">
          <Link href="/newsletter" className="hover:text-white transition-colors duration-300">
            Newsletter
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-white transition-colors duration-300">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-white transition-colors duration-300">
            Contact
          </Link>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
