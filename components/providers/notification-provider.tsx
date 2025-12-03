"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Notification } from "@/types/dashboard"
import { useUser } from "./user-provider"

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "userId">) => void
  markAsRead: (id: string) => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const WELCOME_NOTIFICATION = (userId: string): Notification => ({
  id: "welcome-1",
  title: "Welcome to Smart Adapter",
  message:
    "Your account has been successfully created. Start by adding your first adapter to monitor and control your devices safely.",
  timestamp: new Date().toISOString(),
  type: "success",
  read: false,
  priority: "high",
  userId: userId,
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { userId, isInitialized } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [providerInitialized, setProviderInitialized] = useState(false)

  // Generate user-specific localStorage keys
  const getUserNotificationsKey = (uid: string) => `smart_adapter_notifications_${uid}`
  const getUserWelcomeKey = (uid: string) => `smart_adapter_welcome_shown_${uid}`

  useEffect(() => {
    if (!isInitialized || !userId) return

    const initializeNotifications = () => {
      try {
        // Check if welcome message has been shown before for this user
        const welcomeKey = getUserWelcomeKey(userId)
        const notificationsKey = getUserNotificationsKey(userId)
        
        const welcomeShown = localStorage.getItem(welcomeKey)
        const storedNotifications = localStorage.getItem(notificationsKey)

        let initialNotifications: Notification[] = []

        if (storedNotifications) {
          try {
            initialNotifications = JSON.parse(storedNotifications).filter(
              (notif: Notification) => notif.userId === userId
            )
          } catch (e) {
            console.error("Failed to parse stored notifications", e)
          }
        }

        // Only add welcome notification if it hasn't been shown for this user
        if (!welcomeShown) {
          initialNotifications = [WELCOME_NOTIFICATION(userId), ...initialNotifications]
          localStorage.setItem(welcomeKey, "true")
        }

        setNotifications(initialNotifications)
      } catch (e) {
        console.error("Failed to load notifications", e)
      } finally {
        setProviderInitialized(true)
      }
    }

    initializeNotifications()
  }, [userId, isInitialized])

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    // Only save if we have initialized and have a userId
    if (providerInitialized && userId) {
      const notificationsKey = getUserNotificationsKey(userId)
      const userNotifications = notifications.filter((notif) => notif.userId === userId)
      localStorage.setItem(notificationsKey, JSON.stringify(userNotifications))
    }
  }, [notifications, providerInitialized, userId])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "userId">) => {
    if (!userId) {
      console.warn("Cannot add notification: userId not available")
      return
    }

    const newNotification: Notification = {
      ...notification,
      userId: userId,
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
    setNotifications((prev) => prev.filter((notif) => notif.userId !== userId))
  }

  // Filter notifications to only show current user's notifications
  const userNotifications = notifications.filter((notif) => notif.userId === userId)

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        addNotification,
        markAsRead,
        deleteNotification,
        clearAll,
        isLoading: !providerInitialized,
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

