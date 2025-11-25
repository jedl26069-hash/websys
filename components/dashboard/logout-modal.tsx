"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6 m-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Log Out?</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to log out of your account?</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          You will be returned to the login screen and your current session will be ended.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
