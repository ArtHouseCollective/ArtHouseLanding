"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface ExternalLinkDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  url: string
  title: string
}

export function ExternalLinkDialog({ isOpen, onClose, onConfirm, url, title }: ExternalLinkDialogProps) {
  const domain = url ? new URL(url).hostname : ""

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ExternalLink className="h-5 w-5" />
            Leaving ArtHouse
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            You're about to visit an external website to read the full newsletter article.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">{title}</h4>
            <p className="text-sm text-zinc-400 break-all">{domain}</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 bg-transparent"
          >
            Stay on ArtHouse
          </Button>
          <Button onClick={onConfirm} className="bg-yellow-600 hover:bg-yellow-700 text-black">
            Continue to Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
