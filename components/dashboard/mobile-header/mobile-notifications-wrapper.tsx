"use client"

import type React from "react"
import { useNotifications } from "@/components/providers/notification-provider"

interface MobileNotificationsWrapperProps {
  children: (unreadCount: number) => React.ReactNode
}

export default function MobileNotificationsWrapper({ children }: MobileNotificationsWrapperProps) {
  const { notifications } = useNotifications()
  const unreadCount = notifications.filter((n) => !n.read).length

  return <>{children(unreadCount)}</>
}
