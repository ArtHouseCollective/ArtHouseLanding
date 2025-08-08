"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RetroNav } from "@/components/retro-nav"
import {
  Calendar,
  Users,
  ArrowRight,
  Mail,
  Plus,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  Monitor,
} from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  date: any
  time: string
  location: string
  isVirtual: boolean
  maxAttendees?: number
  currentAttendees: number
  isPrivate: boolean
  createdBy: string
  createdAt: any
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  tags: string[]
  attendees?: string[]
  admins?: string[]
}

export default function DiscoverPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  
  // Newsletter signup state
  const [email, setEmail] = useState("")
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false)
  const [newsletterMessage, setNewsletterMessage] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Workshop",
    date: "",
    time: "",
    location: "",
    isVirtual: false,
    maxAttendees: "",
    isPrivate: false,
    tags: "",
  })

  const router = useRouter()

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // If Firebase not configured, just fetch events without auth
      fetchEvents()
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Check approval status and admin rights
        try {
          const token = await user.getIdTokenResult()
          const approved = token.claims.approved === true
          const admin = token.claims.admin === true || token.claims.role === "admin"
          
          setIsApproved(approved)
          setIsAdmin(admin)
        } catch (error) {
          console.error("Error checking user status:", error)
        }
      }

      await fetchEvents()
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setEventsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const endpoint = editingEvent ? `/api/events/${editingEvent.id}` : "/api/events"
      const method = editingEvent ? "PUT" : "POST"
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
          createdBy: user?.email,
        }),
      })

      if (response.ok) {
        await fetchEvents()
        setShowCreateDialog(false)
        setEditingEvent(null)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventType: "Workshop",
      date: "",
      time: "",
      location: "",
      isVirtual: false,
      maxAttendees: "",
      isPrivate: false,
      tags: "",
    })
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      date: event.date ? new Date(event.date.toDate()).toISOString().split('T')[0] : "",
      time: event.time,
      location: event.location,
      isVirtual: event.isVirtual,
      maxAttendees: event.maxAttendees?.toString() || "",
      isPrivate: event.isPrivate,
      tags: event.tags.join(", "),
    })
    setShowCreateDialog(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchEvents()
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const handleStatusUpdate = async (eventId: string, status: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchEvents()
      }
    } catch (error) {
      console.error("Error updating event status:", error)
    }
  }

  const canManageEvent = (event: Event) => {
    return isAdmin || event.createdBy === user?.email || event.admins?.includes(user?.email || "")
  }

  const handleEventSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsNewsletterLoading(true)
    setNewsletterMessage("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "events" }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewsletterMessage("Thanks! You'll be the first to know about events.")
        setEmail("")
      } else {
        setNewsletterMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setNewsletterMessage("Network error. Please try again.")
    } finally {
      setIsNewsletterLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "TBD"
    
    let date: Date
    if (timestamp.toDate) {
      date = timestamp.toDate()
    } else {
      date = new Date(timestamp)
    }
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Upcoming</Badge>
      case "ongoing":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Live Now</Badge>
      case "completed":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelled</Badge>
      default:
        return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">{status}</Badge>
    }
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

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              Discover
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Explore ArtHouse events, join creative collectives, and connect with the community that's shaping the future
              of creative collaboration.
            </p>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">Events</h2>
                <p className="text-zinc-400">Exclusive screenings, workshops, and creative meetups</p>
              </div>
              
              {(isApproved || isAdmin) && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white flex items-center gap-2"
                      onClick={() => {
                        setEditingEvent(null)
                        resetForm()
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingEvent ? "Edit Event" : "Create New Event"}
                      </DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        {editingEvent ? "Update event details" : "Schedule a new ArtHouse event"}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        placeholder="Event Title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        className="bg-zinc-800/50 border-zinc-600 text-white"
                      />
                      
                      <Textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                        className="bg-zinc-800/50 border-zinc-600 text-white min-h-[80px]"
                      />
                      
                      <select
                        value={formData.eventType}
                        onChange={(e) => handleInputChange("eventType", e.target.value)}
                        className="w-full bg-zinc-800/50 border border-zinc-600 rounded-md px-3 py-2 text-white"
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Screening">Screening</option>
                        <option value="Networking">Networking</option>
                        <option value="Panel">Panel Discussion</option>
                        <option value="Showcase">Showcase</option>
                        <option value="Social">Social Event</option>
                        <option value="Other">Other</option>
                      </select>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                          required
                          className="bg-zinc-800/50 border-zinc-600 text-white"
                        />
                        <Input
                          type="time"
                          value={formData.time}
                          onChange={(e) => handleInputChange("time", e.target.value)}
                          required
                          className="bg-zinc-800/50 border-zinc-600 text-white"
                        />
                      </div>
                      
                      <Input
                        placeholder="Location or Platform"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        required
                        className="bg-zinc-800/50 border-zinc-600 text-white"
                      />
                      
                      <Input
                        type="number"
                        placeholder="Max Attendees (optional)"
                        value={formData.maxAttendees}
                        onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-600 text-white"
                      />
                      
                      <Input
                        placeholder="Tags (comma separated)"
                        value={formData.tags}
                        onChange={(e) => handleInputChange("tags", e.target.value)}
                        className="bg-zinc-800/50 border-zinc-600 text-white"
                      />
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isVirtual"
                            checked={formData.isVirtual}
                            onChange={(e) => handleInputChange("isVirtual", e.target.checked)}
                            className="rounded"
                          />
                          <label htmlFor="isVirtual" className="text-sm text-zinc-300">
                            Virtual event
                          </label>
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
                            Private event (invite-only)
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {editingEvent ? "Update" : "Create"} Event
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCreateDialog(false)
                            setEditingEvent(null)
                          }}
                          className="border-zinc-600 text-white hover:bg-zinc-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Events Grid */}
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Loading events...</span>
                </div>
              </div>
            ) : events.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
                  <p className="text-zinc-400 mb-6">Events will appear here once they're scheduled.</p>
                  
                  {!user ? (
                    <div className="max-w-md mx-auto">
                      <p className="text-zinc-300 mb-4">Be the first to know when events are announced:</p>
                      <form onSubmit={handleEventSignup}>
                        <div className="flex gap-3">
                          <Input
                            type="email"
                            placeholder="Enter your email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isNewsletterLoading}
                            className="flex-1 bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500"
                          />
                          <Button
                            type="submit"
                            disabled={isNewsletterLoading}
                            className="bg-white text-black hover:bg-zinc-200"
                          >
                            {isNewsletterLoading ? "..." : "Notify Me"}
                          </Button>
                        </div>
                        {newsletterMessage && (
                          <p className={`mt-3 text-sm ${newsletterMessage.includes("Thanks") ? "text-green-400" : "text-red-400"}`}>
                            {newsletterMessage}
                          </p>
                        )}
                      </form>
                    </div>
                  ) : (isApproved || isAdmin) ? (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Event
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 transition-all duration-300 group"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white flex items-center gap-2">
                            {event.title}
                            {event.isPrivate && <EyeOff className="w-4 h-4 text-zinc-400" />}
                            {event.isVirtual && <Monitor className="w-4 h-4 text-blue-400" />}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-xs">
                              {event.eventType}
                            </Badge>
                            {getStatusBadge(event.status)}
                          </div>
                        </div>
                        
                        {canManageEvent(event) && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(event)}
                              className="h-8 w-8 p-0 hover:bg-zinc-700"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(event.id)}
                              className="h-8 w-8 p-0 hover:bg-red-600/20 text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-zinc-400 text-sm line-clamp-3">{event.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.currentAttendees} attending
                            {event.maxAttendees && ` / ${event.maxAttendees} max`}
                          </span>
                        </div>
                      </div>
                      
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {event.tags.length > 3 && (
                            <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs">
                              +{event.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                        {canManageEvent(event) && (
                          <select
                            value={event.status}
                            onChange={(e) => handleStatusUpdate(event.id, e.target.value)}
                            className="text-xs bg-zinc-800 border-zinc-600 rounded px-2 py-1 text-white"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Live Now</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                        
                        <Button
                          size="sm"
                          disabled={event.status === "cancelled" || event.status === "completed"}
                          className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white ml-auto"
                        >
                          {event.status === "upcoming" ? "RSVP" : event.status === "ongoing" ? "Join Now" : "View Details"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Collectives Section */}
        <section id="collectives" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-white">Collectives</CardTitle>
                <p className="text-zinc-400 text-lg">Communities within ArtHouse — by city, genre, or mission</p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-zinc-800/50 rounded-lg p-8 border border-zinc-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4">Join Creative Communities</h3>
                  <p className="text-zinc-300 mb-6">Connect with like-minded creators in your area or specialty.</p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white font-medium px-6 py-3 rounded-full transition shadow-lg hover:shadow-xl"
                  >
                    <Link href="/collectives" className="flex items-center space-x-2">
                      <span>Explore Collectives</span>
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-zinc-900/30 rounded-2xl p-8 border border-zinc-800">
              <Mail className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
              <h2 className="text-2xl font-bold text-white mb-4">Stay in the Loop</h2>
              <p className="text-zinc-400 mb-6">
                Get updates on new features, events, and opportunities as we build the future of creative collaboration.
              </p>
              <Button asChild className="bg-white text-black hover:bg-zinc-200 transition-colors font-semibold px-8 py-3">
                <Link href="/newsletter">Join Newsletter</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background-image: radial-gradient(50% 50% at 50% 50%, rgba(30, 41, 59, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
        }
      `}</style>
    </div>
  )
}