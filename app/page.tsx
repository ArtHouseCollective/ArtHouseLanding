"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/* -------------------------------------------------------------------------- */
/*                               Creator Stubs                                */
/* -------------------------------------------------------------------------- */

const creators = [
  {
    name: "Jadon Cal",
    title: "Director",
    image: "/images/creators/JadonCal.jpg",
    genre: "Drama / Surreal",
    specialty: "Off Rip, Skippin' Town",
  },
  {
    name: "Avi Youabian",
    title: "Director",
    image: "/images/creators/AviYouabian.jpeg",
    genre: "Action / Drama",
    specialty: "Countdown, FBI International",
  },
  {
    name: "Meghan Carrasquillo",
    title: "Actress",
    image: "/images/creators/meghancarrasquillo2.jpg",
    genre: "Thriller / Horror",
    specialty: "Stiletto, FOUR",
  },
  {
    name: "Ethan Zeitman",
    title: "Sound Department",
    image: "/images/creators/ethanz.jpeg",
    genre: "Action, Horror",
    specialty: "Fall Guy, Bot or Not",
  },
  {
    name: "Jake Jalbert",
    title: "Cinematographer",
    image: "/images/creators/jakejalbert.jpeg",
    genre: "Action, Drama",
    specialty: "DC Down, Off Rip",
  },
  {
    name: "John Demari",
    title: "Singer / Actor",
    image: "/images/creators/beachfly.jpeg",
    genre: "Reggae, Drama",
    specialty: "Beachfly, Florida Wild",
  },
  {
    name: "Lauren Elyse Buckley",
    title: "Actress",
    image: "/images/creators/laurenelyse.jpeg",
    genre: "Comedy",
    specialty: "Magnum P.I., Foursome",
  },
  {
    name: "Rhondda Stark Atlas",
    title: "Producer",
    image: "/images/creators/rhondda.jpg",
    genre: "Comedy, Action",
    specialty: "Hacked: A Double Entendre of Rage-Fueled Karma",
  },
] as const

/* -------------------------------------------------------------------------- */
/*                                Page Component                              */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [foundersCount] = useState(33) // 🔒 replace with live data later

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Kick off Beehiiv & referral sign-ups simultaneously
      const [beehiivRes, referralRes] = await Promise.all([
        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
        fetch("/api/referralSignup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
      ])

      // Minimal error handling
      if (beehiivRes.ok && referralRes.ok) {
        setIsSubmitted(true)
      } else {
        const beeErr = (await beehiivRes.json()).error
        const refErr = (await referralRes.json()).error
        setError(beeErr || refErr || "Something went wrong – please try again.")
      }
    } catch {
      setError("Network error – please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  /* --------------------------------- JSX ---------------------------------- */

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      {/* ----------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* subtle radial background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.2)_0%,transparent_70%)]" />

        <h1 className="relative z-10 mb-6 text-6xl font-extrabold tracking-tight md:text-8xl">
          <span className="bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent">
            ArtHouse
          </span>
        </h1>
        <p className="relative z-10 mb-10 text-xl text-zinc-300 md:text-2xl">Where bold creatives meet.</p>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md space-y-4">
            <Input
              type="email"
              required
              placeholder="Enter your email for early access…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="text-lg placeholder:text-zinc-500"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full bg-white text-black hover:bg-zinc-200">
              {isLoading ? "Joining…" : "Request Invite"}
            </Button>
          </form>
        ) : (
          <p className="relative z-10 mt-4 text-lg text-green-400">🎉 Thanks for signing up! Check your inbox.</p>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Continuous Carousel                                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="overflow-hidden bg-black py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-zinc-200">Creators in the Founder’s Circle</h2>

        {/* 2× array for seamless loop */}
        <div className="animate-scrollLoop flex w-[200%] space-x-8">
          {[...creators, ...creators].map((c, i) => (
            <article
              key={i}
              className="relative w-80 shrink-0 rounded-2xl border border-zinc-700/50 bg-zinc-900/70 p-8 backdrop-blur"
            >
              {/* golden glow */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 blur-xl" />
              <img
                src={c.image || "/placeholder.svg"}
                alt={c.name}
                className="mx-auto mb-6 h-32 w-32 rounded-2xl object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=128"
                }}
              />
              <h3 className="mb-1 text-2xl font-bold">{c.name}</h3>
              <p className="mb-1 text-lg font-medium text-yellow-400">{c.title}</p>
              <p className="mb-1 text-xs uppercase tracking-wide text-zinc-300">{c.genre}</p>
              <p className="text-sm text-zinc-400">{c.specialty}</p>
            </article>
          ))}
        </div>

        <style jsx>{`
          @keyframes scrollLoop {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scrollLoop {
            animation: scrollLoop 40s linear infinite;
          }
        `}</style>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Final CTA                                                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="px-4 py-20 text-center">
        <h2 className="mb-4 text-4xl font-bold">Join the growing community.</h2>
        <p className="mb-8 text-xl text-zinc-400">Refer friends for rewards …</p>
        <Button className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-black hover:bg-zinc-200">
          Invite Friends →
        </Button>
      </section>

      {/* Floating badge */}
      <div className="fixed bottom-6 right-6 z-50 rounded-full border border-zinc-700 bg-black px-4 py-2 shadow-lg backdrop-blur">
        <span className="mr-2">🪩</span>
        <span className="text-sm">{foundersCount} / 150 Founders Circle Spots Filled</span>
      </div>

      {/* Footer */}
      <footer className="px-4 py-8 text-center text-sm text-zinc-500">
        <a href="#" className="hover:text-white">
          About
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-white">
          Privacy
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-white">
          Contact
        </a>
      </footer>
    </main>
  )
}
