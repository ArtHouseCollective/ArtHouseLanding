import type React from "react"
import type { Metadata } from "next"
import { Inter, Anton, Permanent_Marker } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-hand" })

export const metadata: Metadata = {
  title: "ArtHouse",
  description: "Where bold creatives meet.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${anton.variable} ${marker.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
