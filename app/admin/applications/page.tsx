"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Loader2,
  UserIcon,
  Mail,
  Briefcase,
  Calendar,
  Hash,
  Clock,
  Star,
} from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  name?: string
  fullName?: string
  email: string
  role?: string
  creativeRoles?: string[]
  projectId?: string
  appliedAt?: any
  createdAt?: any
  status?: "pending" | "approved" | "rejected" | "waitlist" | "shortlist"
  portfolioLink?: string
  bio?: string
}

export default function AdminApplicationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Check if user has admin role
        const token = await user.getIdTokenResult()
        const isUserAdmin = token.claims.admin === true || token.claims.role === "admin"
        setIsAdmin(isUserAdmin)

        if (!isUserAdmin) {
          router.push("/login")
          return
        }

        // Fetch applications
        fetchApplications()
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications")
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        console.error("Failed to fetch applications")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setApplicationsLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: "approved" | "rejected" | "waitlist" | "shortlist") => {
    setProcessingId(applicationId)

    try {
      const response = await fetch("/api/approve-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
      } else {
        console.error("Failed to update application status")
      }
    } catch (error) {
      console.error("Error updating application:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    let date: Date
    if (timestamp.toDate) {
      // Firestore timestamp
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
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
    }
  }

  const truncateText = (text: string, maxLength = 100) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-zinc-400 mb-6">You don't have permission to access this admin dashboard.</p>
            <Button asChild className="bg-white text-black hover:bg-zinc-200">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute inset-0 bg-gradient-radial from-zinc-800/10 via-transparent to-black/20" />

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-zinc-400 text-lg">Review and manage ArtHouse applications</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500">Logged in as</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">{applications.length}</div>
                <div className="text-sm text-zinc-400">Total Applications</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">
                  {applications.filter((app) => app.status === "approved").length}
                </div>
                <div className="text-sm text-zinc-400">Approved</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-400">
                  {applications.filter((app) => !app.status || app.status === "pending").length}
                </div>
                <div className="text-sm text-zinc-400">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-400">
                  {applications.filter((app) => app.status === "rejected").length}
                </div>
                <div className="text-sm text-zinc-400">Rejected</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-400">
                  {applications.filter((app) => app.status === "waitlist").length}
                </div>
                <div className="text-sm text-zinc-400">Waitlist</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {applications.filter((app) => app.status === "shortlist").length}
                </div>
                <div className="text-sm text-zinc-400">Shortlist</div>
              </CardContent>
            </Card>
          </div>

          {/* Applications */}
          {applicationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg">Loading applications...</span>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <UserIcon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-zinc-400">Applications will appear here once users start applying.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {applications.map((application) => (
                <Card
                  key={application.id}
                  className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">
                            {application.name || application.fullName || "Unknown"}
                          </CardTitle>
                          <div className="flex items-center text-zinc-400 text-sm">
                            <Mail className="w-3 h-3 mr-1" />
                            {application.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(application.status)}
                        <div className="text-xs text-zinc-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(application.appliedAt || application.createdAt)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Role/Creative Roles */}
                      {(application.role || application.creativeRoles) && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-300">Role</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {application.role && (
                              <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                                {application.role}
                              </Badge>
                            )}
                            {application.creativeRoles?.map((role, index) => (
                              <Badge key={index} variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Project ID */}
                      {application.projectId && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-300">Project ID</span>
                          </div>
                          <code className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                            {application.projectId}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Portfolio Link */}
                    {application.portfolioLink && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ExternalLink className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm font-medium text-zinc-300">Portfolio</span>
                        </div>
                        <a
                          href={application.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm"
                        >
                          <span className="truncate max-w-xs">{application.portfolioLink}</span>
                          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    )}

                    {/* Bio */}
                    {application.bio && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-zinc-300">Bio</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">{truncateText(application.bio, 200)}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {(!application.status || application.status === "pending" || application.status === "waitlist" || application.status === "shortlist") && (
                      <div className="pt-4 border-t border-zinc-700">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Button
                            onClick={() => handleStatusUpdate(application.id, "approved")}
                            disabled={processingId === application.id}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm"
                            size="sm"
                          >
                            {processingId === application.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(application.id, "shortlist")}
                            disabled={processingId === application.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm"
                            size="sm"
                          >
                            {processingId === application.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Star className="w-3 h-3" />
                            )}
                            Shortlist
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(application.id, "waitlist")}
                            disabled={processingId === application.id}
                            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 text-sm"
                            size="sm"
                          >
                            {processingId === application.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            Waitlist
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(application.id, "rejected")}
                            disabled={processingId === application.id}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-sm"
                            size="sm"
                          >
                            {processingId === application.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
