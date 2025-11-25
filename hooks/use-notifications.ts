"use client"

import { useNotifications as useNotificationContext } from "@/components/providers/notification-provider"

export function useNotifications() {
  const { notifications, addNotification, markAsRead, deleteNotification, clearAll, isLoading } =
    useNotificationContext()

  return {
    notifications,
    isLoading,
    addNotification,
    markAsRead,
    deleteNotification,
    clearAll,
  }
}
