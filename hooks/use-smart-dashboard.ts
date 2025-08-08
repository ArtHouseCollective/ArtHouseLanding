"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase-client"

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

interface SmartDashboardState {
  user: User | null
  loading: boolean
  isAdmin: boolean
  application: UserApplication | null
  applicationLoading: boolean
  needsToApply: boolean
  canAccessDashboard: boolean
}

export function useSmartDashboard(): SmartDashboardState & {
  navigateToDashboard: () => void
  showApplyPrompt: () => void
} {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<UserApplication | null>(null)
  const [applicationLoading, setApplicationLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  const needsToApply = user && !application && !isAdmin
  const canAccessDashboard = user && (isAdmin || application)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        
        // Check if user is admin
        try {
          const response = await fetch("/api/check-approval", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email, uid: user.uid }),
          })

          if (response.ok) {
            const responseText = await response.text()
            if (responseText) {
              try {
                const data = JSON.parse(responseText)
                setIsAdmin(data.isAdmin || false)
              } catch (parseError) {
                console.error("Failed to parse admin response:", parseError)
              }
            }
          }
        } catch (error) {
          console.error("Admin check error:", error)
        }

        // Fetch user's application if not admin
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
        setUser(null)
        setApplication(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const navigateToDashboard = () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (isAdmin) {
      // Admin users go to admin panel
      router.push("/admin/applications")
      return
    }

    if (application) {
      if (application.status === "approved") {
        // Approved users go to main dashboard with full features
        router.push("/dashboard")
      } else {
        // Pending/rejected users go to application status dashboard
        router.push("/dashboard")
      }
    } else {
      // User hasn't applied - show apply prompt instead of navigating
      showApplyPrompt()
    }
  }

  const showApplyPrompt = () => {
    // This will be handled by the component using this hook
    // We'll create a dialog state that can be managed
  }

  return {
    user,
    loading,
    isAdmin,
    application,
    applicationLoading,
    needsToApply: Boolean(needsToApply),
    canAccessDashboard: Boolean(canAccessDashboard),
    navigateToDashboard,
    showApplyPrompt,
  }
}