"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: "", email: "", subject: "", message: "" })
        toast({
          title: "Message sent!",
          description: "We'll get back to you as soon as possible.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Something went wrong. Please try again.",
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Heading */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Contact Us</h1>
            <p className="text-lg text-zinc-400 font-light">Get in touch with the ArtHouse Team!</p>
          </div>

          {/* Contact Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-zinc-900/50 border-zinc-700 rounded-lg backdrop-blur-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all duration-300 placeholder:text-zinc-500 disabled:opacity-50"
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-zinc-900/50 border-zinc-700 rounded-lg backdrop-blur-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all duration-300 placeholder:text-zinc-500 disabled:opacity-50"
                />
                <Input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-zinc-900/50 border-zinc-700 rounded-lg backdrop-blur-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all duration-300 placeholder:text-zinc-500 disabled:opacity-50"
                />
                <Textarea
                  name="message"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  rows={5}
                  className="w-full px-4 py-3 bg-zinc-900/50 border-zinc-700 rounded-lg backdrop-blur-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all duration-300 placeholder:text-zinc-500 disabled:opacity-50 resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-zinc-400">We'll get back to you as soon as possible.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4">
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
      `}</style>
    </div>
  )
}
