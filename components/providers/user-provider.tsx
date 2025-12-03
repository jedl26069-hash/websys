"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface UserContextType {
  userId: string
  isInitialized: boolean
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize user ID - this is a simple implementation
    // In a real app, you would fetch this from authentication/session
    const initializeUser = () => {
      try {
        // Check if user ID exists in localStorage
        let storedUserId = localStorage.getItem("smart_adapter_user_id")

        // If no user ID exists, generate one (this represents a new user/session)
        if (!storedUserId) {
          storedUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem("smart_adapter_user_id", storedUserId)
        }

        setUserId(storedUserId)
      } catch (e) {
        console.error("Failed to initialize user", e)
        // Fallback user ID if localStorage fails
        setUserId(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeUser()
  }, [])

  return (
    <UserContext.Provider value={{ userId, isInitialized }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
