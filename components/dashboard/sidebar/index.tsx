"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import BracketsIcon from "@/components/icons/brackets"
import { Plus } from "lucide-react"
import { Bullet } from "@/components/ui/bullet"
import { useIsV0 } from "@/lib/v0-context"
import { useAdapterStatus } from "@/components/providers/adapter-status-provider"
import { LogOut, Activity, ShieldAlert, PowerOff, Zap, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogoutModal } from "@/components/dashboard/logout-modal"

interface User {
  username: string
  email: string
}

const data = {
  navMain: [
    {
      title: "Menu",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: BracketsIcon,
          isActive: true,
        },
        {
          title: "Add Adapter",
          url: "/add-adapter",
          icon: Plus,
          isActive: false,
        },
      ],
    },
  ],
}

export function DashboardSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0()
  const { activeCount, inactiveCount, safetyTriggerCount, totalCount, undervoltageCount } = useAdapterStatus()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user.php", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }
    fetchUser()
  }, [])

  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} />
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="grid flex-1 text-left text-sm leading-tight pl-2">
          <span className="text-2xl font-display">Smart Adapter</span>
          <span className="text-xs uppercase">Power. Protected.</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group, i) => (
          <SidebarGroup className={cn(i === 0 && "rounded-t-none")} key={group.title}>
            <SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link href={item.url}>
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            System Status
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid gap-2 px-2">
              <div className="flex items-center justify-between p-2 rounded-md bg-sidebar-accent/50 text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  <span>Total Adapters</span>
                </div>
                <span className="font-bold">{totalCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-sidebar-accent/50 text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-green-500" />
                  <span>Active</span>
                </div>
                <span className="font-bold text-green-500">{activeCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-sidebar-accent/50 text-xs">
                <div className="flex items-center gap-2">
                  <PowerOff className="size-4 text-muted-foreground" />
                  <span>Inactive</span>
                </div>
                <span className="font-bold text-muted-foreground">{inactiveCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-yellow-500/10 text-xs border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-yellow-500" />
                  <span>Undervoltage</span>
                </div>
                <span className="font-bold text-yellow-500">{undervoltageCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-red-500/10 text-xs border border-red-500/20">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-4 text-red-500" />
                  <span>Safety Triggers</span>
                </div>
                <span className="font-bold text-red-500">{safetyTriggerCount}</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={`https://api.dicebear.com/9.x/dylan/svg?seed=${user?.username || "user"}`} />
              <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "JD"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.username || "Loading..."}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email || "..."}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground bg-transparent"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>

      <SidebarRail />
    </Sidebar>
  )
}

const handleLogout = async () => {
  try {
    // Call the logout endpoint to destroy PHP session
    await fetch("/api/auth/logout.php", {
      method: "GET",
      credentials: "include",
    })
    // Redirect to login page
    window.location.href = "/api/auth/login.php"
  } catch (error) {
    // Redirect to login anyway
    window.location.href = "/api/auth/login.php"
  }
}
