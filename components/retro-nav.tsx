"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Discover", href: "/discover" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Contact", href: "/contact" },
  { label: "Apply", href: "/apply" },
  { label: "Login", href: "/login" },
  { label: "Merch", href: "/merch" },
]

export function RetroNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-md bg-black/90" : ""
      }`}
    >
      {/* Desktop Navigation */}
      <div className="hidden md:block">
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
            {/* Duplicate the nav items for seamless loop */}
            {[...navItems, ...navItems, ...navItems].map((item, index) => (
              <Link
                key={`${item.href}-${index}`}
                href={item.href}
                className={`text-white hover:text-zinc-300 transition-colors duration-200 hover:underline underline-offset-4 ${
                  pathname === item.href ? "text-zinc-400" : ""
                }`}
                onClick={() => {
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }, 100)
                }}
              >
                [ {item.label} ]
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-center py-4 px-4">
        <Link href="/" className="text-white font-mono text-lg font-bold">
          [ ArtHouse ]
        </Link>
      </div>
    </nav>
  )
}
