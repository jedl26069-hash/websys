"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

type AdapterStatus = "active" | "inactive" | "overload" | "undervoltage"

interface AdapterStatusContextType {
  statuses: Record<string, AdapterStatus>
  safetyTriggerCount: number
  updateStatus: (id: string, status: AdapterStatus) => void
  incrementSafetyTrigger: () => void
  unregisterAdapter: (id: string) => void
  activeCount: number
  inactiveCount: number
  totalCount: number
  undervoltageCount: number
}

const AdapterStatusContext = createContext<AdapterStatusContextType | undefined>(undefined)

export function AdapterStatusProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, AdapterStatus>>({})
  const [safetyTriggerCount, setSafetyTriggerCount] = useState(0)

  const updateStatus = useCallback((id: string, status: AdapterStatus) => {
    setStatuses((prev) => {
      if (prev[id] === status) return prev
      return { ...prev, [id]: status }
    })
  }, [])

  const unregisterAdapter = useCallback((id: string) => {
    setStatuses((prev) => {
      const newStatuses = { ...prev }
      delete newStatuses[id]
      return newStatuses
    })
  }, [])

  const incrementSafetyTrigger = useCallback(() => {
    setSafetyTriggerCount((prev) => prev + 1)
  }, [])

  const activeCount = Object.values(statuses).filter((s) => s === "active" || s === "undervoltage").length
  const inactiveCount = Object.values(statuses).filter((s) => s === "inactive" || s === "overload").length
  const totalCount = Object.keys(statuses).length
  const undervoltageCount = Object.values(statuses).filter((s) => s === "undervoltage").length

  return (
    <AdapterStatusContext.Provider
      value={{
        statuses,
        safetyTriggerCount,
        updateStatus,
        incrementSafetyTrigger,
        unregisterAdapter,
        activeCount,
        inactiveCount,
        totalCount,
        undervoltageCount,
      }}
    >
      {children}
    </AdapterStatusContext.Provider>
  )
}

export function useAdapterStatus() {
  const context = useContext(AdapterStatusContext)
  if (context === undefined) {
    throw new Error("useAdapterStatus must be used within a AdapterStatusProvider")
  }
  return context
}
