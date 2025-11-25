"use client"

import { useState, useEffect } from "react"

export interface Adapter {
  id: string
  name: string
  label?: string | null // Add label field
  location?: string | null // Add location field
  addedAt: string
}

export function useAdapters() {
  const [adapters, setAdapters] = useState<Adapter[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAdapters = async () => {
    try {
      const response = await fetch("/mysystem/api/adapters/list.php", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setAdapters(data)
      }
    } catch (error) {
      console.error("Failed to fetch adapters:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdapters()
  }, [])

  const addAdapter = async (id: string) => {
    const newAdapter = {
      id,
      name: `Adapter ${id}`,
    }

    try {
      const response = await fetch("/mysystem/api/adapters/add.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newAdapter),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Failed to add adapter" }
      }

      await fetchAdapters()

      return { success: true, adapter: newAdapter }
    } catch (error: any) {
      console.error("Failed to add adapter:", error)
      return { success: false, error: error.message || "Network error occurred" }
    }
  }

  const removeAdapter = async (id: string) => {
    try {
      await fetch("/mysystem/api/adapters/delete.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      })

      setAdapters((prev) => prev.filter((a) => a.id !== id))
    } catch (error) {
      console.error("Failed to remove adapter:", error)
    }
  }

  const updateLabel = async (id: string, label: string, location?: string) => {
    try {
      const response = await fetch("/mysystem/api/adapters/update-label.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, label, location }),
      })

      if (response.ok) {
        await fetchAdapters()
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error("Failed to update label:", error)
      return { success: false }
    }
  }

  return {
    adapters,
    isLoading,
    addAdapter,
    removeAdapter,
    updateLabel, // Export new function
  }
}
