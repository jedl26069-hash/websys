"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Notification } from "@/types/dashboard"

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  markAsRead: (id: string) => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const WELCOME_NOTIFICATION: Notification = {
  id: "welcome-1",
  title: "Welcome to Smart Adapter",
  message:
    "Your account has been successfully created. Start by adding your first adapter to monitor and control your devices safely.",
  timestamp: new Date().toISOString(),
  type: "success",
  read: false,
  priority: "high",
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeNotifications = () => {
      try {
        // Check if welcome message has been shown before
        const welcomeShown = localStorage.getItem("smart_adapter_welcome_shown")
        const storedNotifications = localStorage.getItem("smart_adapter_notifications")

        let initialNotifications: Notification[] = []

        if (storedNotifications) {
          initialNotifications = JSON.parse(storedNotifications)
        }

        // Only add welcome notification if it hasn't been shown AND we have no other notifications
        // (or strictly if it hasn't been shown, depending on requirement.
        // User said: "make it only create a welcome notification when a account is newly created")
        if (!welcomeShown) {
          // It's a new "account" (browser session)
          initialNotifications = [WELCOME_NOTIFICATION, ...initialNotifications]
          localStorage.setItem("smart_adapter_welcome_shown", "true")
        }

        setNotifications(initialNotifications)
      } catch (e) {
        console.error("Failed to load notifications", e)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeNotifications()
  }, [])

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    // Only save if we have initialized to avoid overwriting with empty array on mount
    if (isInitialized) {
      localStorage.setItem("smart_adapter_notifications", JSON.stringify(notifications))
    }
  }, [notifications, isInitialized])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        deleteNotification,
        clearAll,
        isLoading: !isInitialized,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
