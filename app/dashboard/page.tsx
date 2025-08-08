"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RetroNav } from "@/components/retro-nav"
import {
  ArrowLeft,
  Loader2,
  UserIcon,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Settings,
  LogOut,
} from "lucide-react"

interface UserApplication {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status?: "pending" | "approved" | "rejected" | "waitlist" | "shortlist"
  creativeRoles?: string[]
  submittedAt?: any
  reviewedAt?: any
  reviewNotes?: string
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<UserApplication | null>(null)
  const [applicationLoading, setApplicationLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isFirebaseConfigured) {
      router.push("/")
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        
        // Check if user is admin
        try {
          const token = await user.getIdTokenResult()
          setIsAdmin(token.claims.admin === true || token.claims.role === "admin")
        } catch (error) {
          console.error("Error checking admin status:", error)
        }

        // Fetch user's application
        try {
          const response = await fetch("/api/user-application", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, uid: user.uid }),
          })

          if (response.ok) {
            const data = await response.json()
            setApplication(data.application)
          }
        } catch (error) {
          console.error("Error fetching application:", error)
        }
        setApplicationLoading(false)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>
      case "waitlist":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Waitlist</Badge>
      case "shortlist":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Shortlist</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Under Review</Badge>
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-8 h-8 text-green-400" />
      case "rejected":
        return <XCircle className="w-8 h-8 text-red-400" />
      case "waitlist":
        return <Clock className="w-8 h-8 text-orange-400" />
      case "shortlist":
        return <Star className="w-8 h-8 text-blue-400" />
      default:
        return <Clock className="w-8 h-8 text-yellow-400" />
    }
  }

  const getStatusMessage = (status?: string) => {
    switch (status) {
      case "approved":
        return "Congratulations! Your application has been approved. Welcome to ArtHouse!"
      case "rejected":
        return "Unfortunately, your application was not approved at this time. You can reapply in the future."
      case "waitlist":
        return "Your application is on our waitlist. We'll notify you if a spot becomes available."
      case "shortlist":
        return "Great news! Your application has been shortlisted for final review."
      default:
        return "Your application is currently under review. We'll update you once we've made a decision."
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    let date: Date
    if (timestamp.toDate) {
      date = timestamp.toDate()
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp)
    } else {
      date = new Date(timestamp)
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <RetroNav />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute inset-0 bg-gradient-radial from-zinc-800/10 via-transparent to-black/20" />

      <div className="relative z-10 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-zinc-400 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">My Dashboard</h1>
                <p className="text-zinc-400 text-lg">Welcome back, {user?.displayName || user?.email}</p>
              </div>
              
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Button
                    onClick={() => router.push("/admin/applications")}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </Button>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-zinc-600 text-white hover:bg-zinc-800 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center">
                <UserIcon className="w-8 h-8 text-zinc-400 mr-4" />
                <div>
                  <div className="text-sm text-zinc-400">Email</div>
                  <div className="text-white font-medium">{user?.email}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center">
                <Calendar className="w-8 h-8 text-zinc-400 mr-4" />
                <div>
                  <div className="text-sm text-zinc-400">Member Since</div>
                  <div className="text-white font-medium">
                    {user?.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : "N/A"
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center">
                <Mail className="w-8 h-8 text-zinc-400 mr-4" />
                <div>
                  <div className="text-sm text-zinc-400">Email Verified</div>
                  <div className="text-white font-medium">
                    {user?.emailVerified ? (
                      <span className="text-green-400">✓ Verified</span>
                    ) : (
                      <span className="text-red-400">✗ Not Verified</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Status */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                  {applicationLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  ) : (
                    getStatusIcon(application?.status)
                  )}
                </div>
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {applicationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading application status...</span>
                </div>
              ) : !application ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Application Found</h3>
                  <p className="text-zinc-400 mb-6">You haven't submitted an application yet.</p>
                  <Button
                    onClick={() => router.push("/apply")}
                    className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white font-medium py-3 px-6 rounded-full"
                  >
                    Apply Now
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {application.firstName && application.lastName
                          ? `${application.firstName} ${application.lastName}`
                          : application.email}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="text-right text-sm text-zinc-500">
                      <div>Submitted: {formatDate(application.submittedAt)}</div>
                      {application.reviewedAt && (
                        <div>Reviewed: {formatDate(application.reviewedAt)}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-zinc-300">{getStatusMessage(application.status)}</p>
                    {application.reviewNotes && (
                      <div className="mt-4 pt-4 border-t border-zinc-700">
                        <h4 className="text-white font-medium mb-2">Review Notes:</h4>
                        <p className="text-zinc-400 text-sm">{application.reviewNotes}</p>
                      </div>
                    )}
                  </div>

                  {application.creativeRoles && application.creativeRoles.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Creative Roles</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.creativeRoles.map((role, index) => (
                          <Badge key={index} variant="outline" className="border-zinc-600 text-zinc-300">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Based on Status */}
                  {application.status === "approved" && (
                    <div className="flex gap-4">
                      <Button
                        onClick={() => router.push("/discover")}
                        className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white"
                      >
                        Explore ArtHouse
                      </Button>
                      <Button
                        onClick={() => router.push("/collectives")}
                        variant="outline"
                        className="border-zinc-600 text-white hover:bg-zinc-800"
                      >
                        Join Collectives
                      </Button>
                    </div>
                  )}

                  {application.status === "rejected" && (
                    <Button
                      onClick={() => router.push("/apply")}
                      variant="outline"
                      className="border-zinc-600 text-white hover:bg-zinc-800"
                    >
                      Submit New Application
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background-image: radial-gradient(50% 50% at 50% 50%, rgba(30, 41, 59, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
        }
      `}</style>
    </div>
  )
}