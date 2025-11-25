"use client"

import type React from "react"
import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Plus, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAdapters } from "@/hooks/use-adapters"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/use-notifications"

export default function AddAdapterPage() {
  const [adapterId, setAdapterId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const { addAdapter } = useAdapters()
  const { addNotification } = useNotifications()
  const router = useRouter()

  const handleAddAdapter = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adapterId.trim()) {
      setMessage({ type: "error", text: "Please enter an Adapter ID" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await addAdapter(adapterId.trim())

      if (result?.success) {
        addNotification({
          title: "Adapter Added",
          message: `Adapter ${adapterId} has been successfully connected to your dashboard.`,
          type: "success",
          priority: "medium",
          read: false,
        })

        setMessage({
          type: "success",
          text: `Adapter ${adapterId} has been successfully added to your dashboard!`,
        })
        setAdapterId("")

        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        setMessage({
          type: "error",
          text: result?.error || "Invalid Adapter ID. Please check and try again.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Add Adapter",
        description: "Connect Your Device",
        icon: Plus,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Register New Smart Adapter</CardTitle>
            <CardDescription>
              Enter your adapter ID to connect it to your dashboard for monitoring and control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdapter} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="adapterId">Adapter ID</Label>
                <Input
                  id="adapterId"
                  placeholder="Enter your adapter ID (e.g., SA-2025-123456)"
                  value={adapterId}
                  onChange={(e) => setAdapterId(e.target.value)}
                  className="font-mono"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  You can find your Adapter ID on the device label or in the packaging
                </p>
              </div>

              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={message.type === "success" ? "border-green-500 bg-green-500/10 text-green-500" : ""}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Adapter
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-accent/50 rounded-lg border border-border">
          <h3 className="font-semibold mb-3">How It Works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Locate your Adapter ID on the device or packaging</li>
            <li>2. Enter the ID in the form above</li>
            <li>3. Our system will verify the ID against our database</li>
            <li>4. Once verified, your adapter will appear in the dashboard</li>
          </ol>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
