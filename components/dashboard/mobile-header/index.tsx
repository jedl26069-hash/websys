import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import MobileNotifications from "@/components/dashboard/notifications/mobile-notifications"
import BellIcon from "@/components/icons/bell"
import MobileNotificationsWrapper from "./mobile-notifications-wrapper"

export function MobileHeader() {
  return (
    <MobileNotificationsWrapper>
      {(unreadCount) => (
        <div className="lg:hidden h-header-mobile sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Sidebar Menu */}
            <SidebarTrigger />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg">Smart Adapter</span>
              </div>
            </div>

            <Sheet>
              {/* Right: Notifications Menu */}
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon" className="relative">
                  {unreadCount > 0 && (
                    <Badge className="absolute border-2 border-background -top-1 -left-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                  <BellIcon className="size-4" />
                </Button>
              </SheetTrigger>

              {/* Notifications Sheet */}
              <SheetContent closeButton={false} side="right" className="w-[80%] max-w-md p-0">
                <MobileNotifications initialNotifications={[]} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}
    </MobileNotificationsWrapper>
  )
}
