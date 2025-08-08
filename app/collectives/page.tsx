"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RetroNav } from "@/components/retro-nav"
import {
  ArrowLeft,
  Users,
  Lock,
  Plus,
  Settings,
  MessageCircle,
  Calendar,
  Loader2,
  Star,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
} from "lucide-react"

interface Collective {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  memberCount: number
  isPrivate: boolean
  createdBy: string
  createdAt: any
  lastActivity: any
  coverImage?: string
  members?: string[]
  admins?: string[]
}

export default function CollectivesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [collectives, setCollectives] = useState<Collective[]>([])
  const [collectivesLoading, setCollectivesLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCollective, setEditingCollective] = useState<Collective | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "General",
    tags: "",
    isPrivate: false,
  })

  const router = useRouter()

  useEffect(() => {
    if (!isFirebaseConfigured) {
      router.push("/")
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        
        // Check approval status and admin rights
        try {
          const token = await user.getIdTokenResult()
          const approved = token.claims.approved === true
          const admin = token.claims.admin === true || token.claims.role === "admin"
          
          setIsApproved(approved)
          setIsAdmin(admin)

          if (approved || admin) {
            fetchCollectives()
          }
        } catch (error) {
          console.error("Error checking user status:", error)
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchCollectives = async () => {
    try {
      const response = await fetch("/api/collectives")
      if (response.ok) {
        const data = await response.json()
        setCollectives(data.collectives || [])
      }
    } catch (error) {
      console.error("Error fetching collectives:", error)
    } finally {
      setCollectivesLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const endpoint = editingCollective ? `/api/collectives/${editingCollective.id}` : "/api/collectives"
      const method = editingCollective ? "PUT" : "POST"
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
          createdBy: user?.email,
        }),
      })

      if (response.ok) {
        await fetchCollectives()
        setShowCreateDialog(false)
        setEditingCollective(null)
        setFormData({
          name: "",
          description: "",
          category: "General",
          tags: "",
          isPrivate: false,
        })
      }
    } catch (error) {
      console.error("Error saving collective:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (collective: Collective) => {
    setEditingCollective(collective)
    setFormData({
      name: collective.name,
      description: collective.description,
      category: collective.category,
      tags: collective.tags.join(", "),
      isPrivate: collective.isPrivate,
    })
    setShowCreateDialog(true)
  }

  const handleDelete = async (collectiveId: string) => {
    if (!confirm("Are you sure you want to delete this collective?")) return

    try {
      const response = await fetch(`/api/collectives/${collectiveId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchCollectives()
      }
    } catch (error) {
      console.error("Error deleting collective:", error)
    }
  }

  const canManageCollective = (collective: Collective) => {
    return isAdmin || collective.createdBy === user?.email || collective.admins?.includes(user?.email || "")
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    
    let date: Date
    if (timestamp.toDate) {
      date = timestamp.toDate()
    } else {
      date = new Date(timestamp)
    }
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  if (!isApproved && !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white">
        <RetroNav />
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Access Required</h2>
                  <p className="text-zinc-400 mb-4">
                    You need to be approved to access Collectives. Please check your application status.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-white text-black hover:bg-zinc-200 transition-colors"
                  >
                    Check Status
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="w-full border-zinc-600 text-white hover:bg-zinc-800 transition-colors"
                  >
                    Return Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
        <div className="max-w-6xl mx-auto">
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
                <h1 className="text-4xl font-bold text-white mb-2">Collectives</h1>
                <p className="text-zinc-400 text-lg">
                  Connect with creative communities and collaborate on amazing projects
                </p>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white flex items-center gap-2"
                    onClick={() => {
                      setEditingCollective(null)
                      setFormData({
                        name: "",
                        description: "",
                        category: "General",
                        tags: "",
                        isPrivate: false,
                      })
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Collective
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCollective ? "Edit Collective" : "Create New Collective"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      {editingCollective ? "Update your collective details" : "Start a new creative community"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Collective Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="bg-zinc-800/50 border-zinc-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                        className="bg-zinc-800/50 border-zinc-600 text-white min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className="w-full bg-zinc-800/50 border border-zinc-600 rounded-md px-3 py-2 text-white"
                      >
                        <option value="General">General</option>
                        <option value="Film">Film</option>
                        <option value="Music">Music</option>
                        <option value="Digital Art">Digital Art</option>
                        <option value="Photography">Photography</option>
                        <option value="Writing">Writing</option>
                        <option value="Theater">Theater</option>
                        <option value="Gaming">Gaming</option>
                      </select>
                    </div>
                    
                    <div>
                      <Input
                        placeholder="Tags (comma separated)"
                        value={formData.tags}
                        onChange={(e) => handleInputChange("tags", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-600 text-white"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={formData.isPrivate}
                        onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="isPrivate" className="text-sm text-zinc-300">
                        Private collective (invite-only)
                      </label>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {editingCollective ? "Update" : "Create"} Collective
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateDialog(false)
                          setEditingCollective(null)
                        }}
                        className="border-zinc-600 text-white hover:bg-zinc-800"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Collectives Grid */}
          {collectivesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg">Loading collectives...</span>
              </div>
            </div>
          ) : collectives.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Collectives Yet</h3>
                <p className="text-zinc-400 mb-6">Be the first to create a collective and start building your creative community.</p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Collective
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectives.map((collective) => (
                <Card
                  key={collective.id}
                  className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 transition-all duration-300 group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white flex items-center gap-2">
                          {collective.name}
                          {collective.isPrivate && (
                            <EyeOff className="w-4 h-4 text-zinc-400" />
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                            {collective.category}
                          </Badge>
                          <div className="flex items-center text-zinc-500 text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {collective.memberCount || 0}
                          </div>
                        </div>
                      </div>
                      
                      {canManageCollective(collective) && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(collective)}
                            className="h-8 w-8 p-0 hover:bg-zinc-700"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(collective.id)}
                            className="h-8 w-8 p-0 hover:bg-red-600/20 text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-zinc-400 text-sm line-clamp-3">{collective.description}</p>
                    
                    {collective.tags && collective.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {collective.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {collective.tags.length > 3 && (
                          <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs">
                            +{collective.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                      <div className="text-xs text-zinc-500">
                        Active {formatDate(collective.lastActivity || collective.createdAt)}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Join Chat
                      </Button>
                    </div>
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