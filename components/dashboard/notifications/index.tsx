"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import NotificationItem from "./notification-item"
import { AnimatePresence, motion } from "framer-motion"
import { useNotifications } from "@/components/providers/notification-provider"

export default function Notifications() {
  const { notifications, markAsRead, deleteNotification, clearAll } = useNotifications()
  const [showAll, setShowAll] = useState(false)

  const handleNotificationClick = (notification: any) => {
    if (notification.adapterId) {
      const element = document.getElementById(`adapter-${notification.adapterId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        // Add a temporary highlight effect
        element.classList.add("ring-2", "ring-primary", "ring-offset-2")
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary", "ring-offset-2")
        }, 2000)
      }
    }
  }

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3)

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pl-3 pr-1">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
          <Badge>{notifications.length}</Badge>
          Notifications
        </CardTitle>
        {notifications.length > 0 && (
          <Button className="opacity-50 hover:opacity-100 uppercase" size="sm" variant="ghost" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="bg-accent p-1.5 overflow-hidden min-h-[100px]">
        <div className="space-y-2 h-full">
          <AnimatePresence initial={false} mode="popLayout">
            {displayedNotifications.map((notification) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={notification.id}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onNotificationClick={handleNotificationClick}
                />
              </motion.div>
            ))}

            {notifications.length === 0 && (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 flex flex-col items-center justify-center h-full"
              >
                <p className="text-sm text-muted-foreground">No notifications</p>
              </motion.div>
            )}

            {notifications.length > 3 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="w-full">
                  {showAll ? "Show Less" : `Show All (${notifications.length})`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
