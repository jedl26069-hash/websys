"use client"

import { useState, useEffect, useRef } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertTriangle, Power, CheckCircle, Zap, Trash2, Edit2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAdapters } from "@/hooks/use-adapters"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { useAdapterStatus } from "@/components/providers/adapter-status-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AdapterStatus = "active" | "inactive" | "overload" | "undervoltage"

function SmartAdapterHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-center">
      <div>
        <h2 className="text-3xl font-bold mb-4">Smart Voltage Adapter</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Monitor real-time voltage fluctuations and protect your devices from dangerous power surges and voltage
          sags. Our intelligent system automatically triggers safety cutoffs when critical thresholds are exceeded.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm">Real-time voltage monitoring</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm">Automatic surge protection</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm">Undervoltage alerts</span>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8 border border-primary/20 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">220V</div>
          <div className="text-sm text-muted-foreground">Standard Operating Voltage</div>
        </div>
      </div>
    </div>
  )
}

interface EditLabelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (label: string, location: string) => Promise<any>
  adapterId: string
  currentLabel?: string | null
  currentLocation?: string | null
}

function EditLabelModal({
  isOpen,
  onClose,
  onSave,
  adapterId,
  currentLabel = "",
  currentLocation = "",
}: EditLabelModalProps) {
  const [label, setLabel] = useState(currentLabel || "")
  const [location, setLocation] = useState(currentLocation || "")
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(label, location)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Edit Adapter Information</CardTitle>
          <CardDescription>Update the label and location for this adapter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="label">Device Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Living Room AC"
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 2nd Floor, North Wall"
              maxLength={100}
            />
          </div>
        </CardContent>
        <div className="flex justify-end gap-3 mt-6 px-6 pb-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<any>
  adapterId: string
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, adapterId }: DeleteConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Adapter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove adapter <span className="font-mono font-bold">{adapterId}</span> from your
            dashboard? This action cannot be undone.
          </p>
        </CardContent>
        <div className="flex justify-end gap-3 mt-6 px-6 pb-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function VoltageMonitor({
  adapterId,
  label,
  location,
  onUpdateLabel,
  onRemove,
}: {
  adapterId: string
  label?: string | null
  location?: string | null
  onUpdateLabel: (id: string, label: string, location?: string) => Promise<any>
  onRemove: (id: string) => Promise<any>
}) {
  const [isOn, setIsOn] = useState(true)
  const [status, setStatus] = useState<AdapterStatus>("active")
  const [data, setData] = useState<{ time: string; voltage: number }[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSurgeTesting, setIsSurgeTesting] = useState(false)
  const [isUndervoltageTesting, setIsUndervoltageTesting] = useState(false)

  const { addNotification } = useNotifications()
  const { updateStatus, incrementSafetyTrigger, unregisterAdapter } = useAdapterStatus()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeRef = useRef(0)
  const hasNotifiedRef = useRef(false)
  const surgeDurationRef = useRef(0)
  const undervoltageDurationRef = useRef(0)
  const simulatedEventRef = useRef<"surge" | "undervoltage" | null>(null)
  const eventTimerRef = useRef(0)

  const THRESHOLD_HIGH = 240
  const THRESHOLD_LOW = 180

  useEffect(() => {
    const loadVoltageHistory = async () => {
      try {
        const response = await fetch(`/api/adapters/get-voltage-history.php?adapter_id=${adapterId}`, {
          credentials: "include",
        })
        if (response.ok) {
          const history = await response.json()
          if (history.length > 0) {
            const formattedHistory = history.map((item: any) => ({
              ...item,
              voltage: Number(item.voltage),
            }))
            setData(formattedHistory)
          }
        }
      } catch (error) {
        console.error("Failed to load voltage history:", error)
      }
    }
    loadVoltageHistory()
  }, [adapterId])

  useEffect(() => {
    updateStatus(adapterId, status)
    return () => unregisterAdapter(adapterId)
  }, [status, adapterId, updateStatus, unregisterAdapter])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      timeRef.current += 1
      const timeString = new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      let newVoltage = 0

      if (isOn) {
        if (!simulatedEventRef.current && !isSurgeTesting && !isUndervoltageTesting) {
          if (Math.random() < 0.05) {
            simulatedEventRef.current = Math.random() > 0.5 ? "surge" : "undervoltage"
            eventTimerRef.current = 0
          }
        }

        let base = 220
        let fluctuation = Math.random() * 10 - 5

        if (isSurgeTesting) {
          base = 270
          fluctuation = Math.random() * 40 - 20
        } else if (isUndervoltageTesting) {
          base = 155
          fluctuation = Math.random() * 30 - 15
        } else if (simulatedEventRef.current === "surge") {
          base = 270
          fluctuation = Math.random() * 40 - 20
          eventTimerRef.current += 1
        } else if (simulatedEventRef.current === "undervoltage") {
          base = 155
          fluctuation = Math.random() * 30 - 15
          eventTimerRef.current += 1
        }

        if (simulatedEventRef.current && eventTimerRef.current > 8) {
          simulatedEventRef.current = null
          eventTimerRef.current = 0
        }

        newVoltage = base + fluctuation

        if (newVoltage > THRESHOLD_HIGH) {
          surgeDurationRef.current += 1
          undervoltageDurationRef.current = 0

          if (surgeDurationRef.current >= 5) {
            setIsOn(false)
            setStatus("overload")
            setNotification(
              "CRITICAL WARNING: Prolonged voltage surge detected! Adapter automatically shut down to prevent fire hazard.",
            )
            incrementSafetyTrigger()
            setIsSurgeTesting(false)
            simulatedEventRef.current = null

            if (!hasNotifiedRef.current) {
              addNotification({
                title: "Safety Cutoff Triggered",
                message: `Adapter ${label || adapterId} detected a prolonged surge (>5s) and shut down to prevent fire hazard. Click to view.`,
                type: "error",
                priority: "high",
                read: false,
                adapterId: adapterId,
              })
              hasNotifiedRef.current = true
            }

            newVoltage = 0
            surgeDurationRef.current = 0
          }
        } else if (newVoltage < THRESHOLD_LOW) {
          undervoltageDurationRef.current += 1
          surgeDurationRef.current = 0

          if (undervoltageDurationRef.current >= 5) {
            setStatus("undervoltage")
            setNotification("WARNING: Prolonged undervoltage detected! Monitoring system active.")
            if (!hasNotifiedRef.current) {
              addNotification({
                title: "Undervoltage Detection",
                message: `Adapter ${label || adapterId} detected prolonged undervoltage (<180V). System is monitoring the instability. Click to view.`,
                type: "warning",
                priority: "medium",
                read: false,
                adapterId: adapterId,
              })
              hasNotifiedRef.current = true
            }
          }
        } else {
          surgeDurationRef.current = 0
          if (status === "undervoltage" && newVoltage >= THRESHOLD_LOW) {
            setStatus("active")
            setNotification(null)
          }
          undervoltageDurationRef.current = 0

          if (status !== "overload" && status !== "undervoltage") {
            setStatus("active")
          }
        }
      } else {
        newVoltage = 0
        surgeDurationRef.current = 0
        undervoltageDurationRef.current = 0
        setIsSurgeTesting(false)
        setIsUndervoltageTesting(false)
        simulatedEventRef.current = null
        if (status !== "overload" && status !== "undervoltage") {
          setStatus("inactive")
        }
      }

      const newReading = { time: timeString, voltage: Math.round(newVoltage) }

      setData((prev) => {
        const newData = [...prev, newReading]
        if (newData.length > 20) return newData.slice(newData.length - 20)
        return newData
      })

      if (timeRef.current % 5 === 0) {
        fetch("/api/adapters/save-voltage.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            adapter_id: adapterId,
            voltage: Math.round(newVoltage),
            status: status,
          }),
        })
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isOn, status, adapterId, addNotification, incrementSafetyTrigger, isSurgeTesting, isUndervoltageTesting, label])

  const handleToggle = () => {
    if (status === "overload") {
      setStatus("inactive")
      setNotification(null)
      setIsOn(false)
      hasNotifiedRef.current = false
      surgeDurationRef.current = 0
      undervoltageDurationRef.current = 0
    } else {
      setIsOn(!isOn)
      if (!isOn) {
        setStatus("active")
        setNotification(null)
      } else {
        setStatus("inactive")
      }
    }
  }

  const toggleSurgeTest = () => {
    if (!isSurgeTesting) {
      setIsSurgeTesting(true)
      setIsUndervoltageTesting(false)
    } else {
      setIsSurgeTesting(false)
    }
  }

  const toggleUndervoltageTest = () => {
    if (!isUndervoltageTesting) {
      setIsUndervoltageTesting(true)
      setIsSurgeTesting(false)
    } else {
      setIsUndervoltageTesting(false)
    }
  }

  const handleRemoveClick = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmRemove = async () => {
    updateStatus(adapterId, "inactive")
    await onRemove(adapterId)
    unregisterAdapter(adapterId)
  }

  const handleSaveLabel = async (newLabel: string, newLocation: string) => {
    await onUpdateLabel(adapterId, newLabel, newLocation)
  }

  return (
    <div className="space-y-6" id={`adapter-${adapterId}`}>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmRemove}
        adapterId={adapterId}
      />

      <EditLabelModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveLabel}
        adapterId={adapterId}
        currentLabel={label}
        currentLocation={location}
      />

      {notification && (
        <Alert
          variant={status === "undervoltage" ? "default" : "destructive"}
          className={`animate-in fade-in slide-in-from-top-2 ${
            status === "undervoltage"
              ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
              : "border-red-500 bg-red-500/10 text-red-500"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{status === "undervoltage" ? "Undervoltage Detection" : "Safety Cutoff Triggered"}</AlertTitle>
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {label ? (
                  <>
                    <span>{label}</span>
                    <span className="text-sm font-mono text-muted-foreground">({adapterId})</span>
                  </>
                ) : (
                  `Live Voltage Monitor (${adapterId})`
                )}
              </CardTitle>
              <CardDescription>{location ? `${location} • ` : ""}Real-time input voltage tracking</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  status === "active"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : status === "overload"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : status === "undervoltage"
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                }`}
              >
                {status}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(true)}
                className="text-muted-foreground hover:text-primary"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveClick}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.1} />
                <XAxis
                  dataKey="time"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 300]}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: "Voltage (V)", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  stroke={status === "overload" ? "#ef4444" : status === "undervoltage" ? "#eab308" : "#22c55e"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => THRESHOLD_HIGH}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name="Max Limit"
                />
                <Line
                  type="monotone"
                  dataKey={() => THRESHOLD_LOW}
                  stroke="#eab308"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name="Min Limit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-accent/50 rounded-lg border border-border">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-muted-foreground">Adapter Power</span>
              <Button
                onClick={handleToggle}
                variant={isOn ? "default" : "outline"}
                size="lg"
                className={`w-32 transition-all duration-300 ${
                  isOn
                    ? "bg-green-600 hover:bg-green-700"
                    : status === "overload"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : status === "undervoltage"
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : ""
                }`}
              >
                <Power className="mr-2 h-4 w-4" />
                {status === "overload" ? "RESET" : isOn ? "OFF" : "ON"}
              </Button>

              <div className="flex flex-col items-center ml-4 border-l pl-4 border-border/50 gap-2">
                <Button
                  onClick={toggleSurgeTest}
                  variant={isSurgeTesting ? "destructive" : "secondary"}
                  size="sm"
                  disabled={!isOn || status === "overload" || status === "undervoltage"}
                  className="w-32"
                >
                  <Zap className={`mr-2 h-3 w-3 ${isSurgeTesting ? "fill-current" : ""}`} />
                  {isSurgeTesting ? "STOP SURGE" : "TEST SURGE"}
                </Button>
                <Button
                  onClick={toggleUndervoltageTest}
                  variant={isUndervoltageTesting ? "default" : "secondary"}
                  size="sm"
                  disabled={!isOn || status === "overload"}
                  className={`w-32 ${isUndervoltageTesting ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
                >
                  <Zap className={`mr-2 h-3 w-3 ${isUndervoltageTesting ? "fill-current" : ""}`} />
                  {isUndervoltageTesting ? "STOP LOW V" : "TEST LOW V"}
                </Button>
              </div>
            </div>
            <div className="flex justify-between w-full max-w-md px-4">
              <p className="text-xs text-muted-foreground text-center flex-1">
                {status === "overload"
                  ? "System locked due to voltage surge. Press RESET to acknowledge."
                  : status === "undervoltage"
                    ? "System detected undervoltage instability. Monitoring active."
                    : "Toggle to manually control power flow. System protects against surge and undervoltage."}
              </p>
              <p className="text-[10px] text-muted-foreground/70 text-right w-32 ml-4">
                Simulate faults to test safety cutoff (hold 5s).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SmartAdapterPageClient() {
  const { adapters, isLoading, updateLabel, removeAdapter } = useAdapters()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <SmartAdapterHero />

      {adapters.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <PlusCircle className="w-12 h-12 text-muted-foreground opacity-50" />
            <div>
              <h3 className="font-semibold mb-2">No adapters connected yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first smart adapter to start monitoring voltage and testing safety features.
              </p>
              <Link href="/add-adapter">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Adapter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {adapters.map((adapter) => (
            <VoltageMonitor
              key={adapter.adapter_id}
              adapterId={adapter.adapter_id}
              label={adapter.label}
              location={adapter.location}
              onUpdateLabel={updateLabel}
              onRemove={removeAdapter}
            />
          ))}
        </div>
      )}
    </>
  )
}
