"use client"

import { useState } from "react"
import { useSmartDashboard } from "@/hooks/use-smart-dashboard"
import { ApplyPromptDialog } from "@/components/apply-prompt-dialog"

interface SmartDashboardLinkProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function SmartDashboardLink({ children, className, onClick }: SmartDashboardLinkProps) {
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const { user, loading, needsToApply, navigateToDashboard } = useSmartDashboard()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }

    if (loading) {
      return
    }

    if (needsToApply) {
      setShowApplyDialog(true)
    } else {
      navigateToDashboard()
    }
  }

  return (
    <>
      <button onClick={handleClick} className={className} disabled={loading}>
        {children}
      </button>
      
      <ApplyPromptDialog
        isOpen={showApplyDialog}
        onClose={() => setShowApplyDialog(false)}
        userEmail={user?.email || undefined}
      />
    </>
  )
}