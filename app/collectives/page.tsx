"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Users, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CollectivesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check authentication and approval status
    const checkAccess = () => {
      const authenticated = localStorage.getItem("isAuthenticated") === "true"
      const approved = localStorage.getItem("isApproved") === "true"
      const email = localStorage.getItem("userEmail") || ""

      setIsAuthenticated(authenticated)
      setIsApproved(approved)
      setUserEmail(email)
      setIsLoading(false)

      // Show access dialog if not authenticated or not approved
      if (!authenticated || !approved) {
        setShowAccessDialog(true)
      }
    }

    checkAccess()
  }, [])

  const handleAccessDialogClose = () => {
    setShowAccessDialog(false)
    router.push("/")
  }

  const handleLogin = () => {
    setShowAccessDialog(false)
    router.push("/login")
  }

  const handleApply = () => {
    setShowAccessDialog(false)
    router.push("/apply")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="text-xl font-bold text-white">ArtHouse</div>
            {isAuthenticated && <div className="text-sm text-zinc-400">Welcome, {userEmail.split("@")[0]}</div>}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Collectives</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Connect with creative communities, collaborate on projects, and build meaningful relationships with fellow
            artists.
          </p>
        </div>

        {/* Collective Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-zinc-900/50 border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white">ArtHouse Central</CardTitle>
                <div className="flex items-center space-x-2 text-zinc-400">
                  <Users size={16} />
                  <span className="text-sm">{isAuthenticated && isApproved ? "127 members" : "•••"}</span>
                </div>
              </div>
              <CardDescription className="text-zinc-400 text-base">
                The main hub for ArtHouse creatives. Share projects, find collaborators, and connect with the community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">Film</span>
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">Digital Media</span>
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">Music</span>
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">Production</span>
                </div>
                <Button
                  className="w-full bg-white text-black hover:bg-zinc-200 transition-colors py-3 text-lg font-semibold"
                  disabled={!isAuthenticated || !isApproved}
                >
                  {isAuthenticated && isApproved ? (
                    "Enter Collective"
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Lock size={16} />
                      <span>Access Required</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Message */}
        {isAuthenticated && !isApproved && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
              <h3 className="text-amber-400 font-semibold mb-2">Application Under Review</h3>
              <p className="text-amber-300/80 text-sm">
                Your application is being reviewed. You'll receive access to Collectives once approved.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Access Dialog */}
      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {!isAuthenticated ? "Login Required" : "Approval Pending"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {!isAuthenticated
                ? "You need to be logged in to access Collectives."
                : "Your application is being reviewed. Access will be granted once approved."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-6">
            {!isAuthenticated ? (
              <>
                <Button onClick={handleLogin} className="bg-white text-black hover:bg-zinc-200">
                  Login
                </Button>
                <Button
                  onClick={handleApply}
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                >
                  Request Access
                </Button>
              </>
            ) : (
              <Button onClick={handleAccessDialogClose} className="bg-white text-black hover:bg-zinc-200">
                Return Home
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
