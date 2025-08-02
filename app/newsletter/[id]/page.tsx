"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface NewsletterPost {
  id: string
  title: string
  subtitle?: string
  content?: string
  content_html?: string
  content_text?: string
  publish_date: string
  created: string
  updated: string
  web_url: string
  thumbnail_url?: string
}

export default function NewsletterPostPage() {
  const params = useParams()
  const [post, setPost] = useState<NewsletterPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/newsletter-post/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch post")
        }
        const data = await response.json()
        console.log("Post data received:", data)
        setPost(data)
      } catch (error) {
        console.error("Error fetching post:", error)
        setError("Unable to load newsletter post")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date unavailable"

    let date: Date | null = null
    date = new Date(dateString)

    if (isNaN(date.getTime())) {
      const timestamp = Number.parseInt(dateString)
      if (!isNaN(timestamp)) {
        date = new Date(timestamp * 1000)
      }
    }

    if (isNaN(date.getTime())) {
      return "Date unavailable"
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="text-zinc-400">Loading newsletter post...</span>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-zinc-400 mb-6">{error || "The newsletter post you're looking for doesn't exist."}</p>
          <Link
            href="/newsletter"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-semibold rounded-lg transition-all duration-300"
          >
            Back to Newsletter
          </Link>
        </div>
      </div>
    )
  }

  // Get the content in order of preference
  const content = post.content_html || post.content || post.content_text || ""

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="p-6 border-b border-zinc-800">
        <Link
          href="/newsletter"
          className="text-zinc-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Newsletter
        </Link>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12">
          {post.thumbnail_url && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden">
              <img
                src={post.thumbnail_url || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="text-sm text-yellow-500 mb-4">
            {formatDate(post.publish_date || post.created || post.updated)}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{post.title}</h1>

          {post.subtitle && <p className="text-xl text-zinc-400 font-light leading-relaxed">{post.subtitle}</p>}
        </header>

        {/* Content */}
        {content ? (
          <div
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-a:text-yellow-500 prose-a:no-underline hover:prose-a:text-yellow-400 prose-strong:text-white prose-blockquote:border-l-yellow-500 prose-blockquote:text-zinc-400"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Content not available for this post.</p>
            <p className="text-sm text-zinc-500 mb-6">
              This might be a draft or the content hasn't been published yet.
            </p>
            <a
              href={post.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-semibold rounded-lg transition-all duration-300"
            >
              View on Beehiiv
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <Link
              href="/newsletter"
              className="inline-flex items-center text-yellow-500 hover:text-yellow-400 transition-colors duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              More Newsletter Issues
            </Link>

            <a
              href={post.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-zinc-400 hover:text-white transition-colors duration-300 text-sm"
            >
              View Original
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </footer>
      </article>
    </div>
  )
}
