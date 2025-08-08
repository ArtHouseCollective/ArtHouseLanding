"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserPlus, ArrowRight } from "lucide-react"

interface ApplyPromptDialogProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

export function ApplyPromptDialog({ isOpen, onClose, userEmail }: ApplyPromptDialogProps) {
  const router = useRouter()

  const handleApplyClick = () => {
    onClose()
    router.push("/apply")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cobalt-600 to-cobalt-700 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          
          <DialogTitle className="text-xl font-semibold text-white">
            Application Required
          </DialogTitle>
          
          <DialogDescription className="text-zinc-400 leading-relaxed">
            To access your dashboard and join the ArtHouse community, you'll need to submit an application first.
            {userEmail && (
              <span className="block mt-2 text-zinc-500 text-sm">
                We'll use your current email: <span className="text-white">{userEmail}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            onClick={handleApplyClick}
            className="w-full bg-gradient-to-r from-cobalt-700 to-cobalt-800 hover:from-cobalt-600 hover:to-cobalt-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
          >
            Start Application
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Maybe Later
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center leading-relaxed">
            ArtHouse is an invite-only creative network. Our application process helps us maintain a curated community of professional artists and creators.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}