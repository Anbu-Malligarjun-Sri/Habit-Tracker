"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/shared/components/ui/sidebar"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { Separator } from "@/shared/components/ui/separator"
import { HabitsProvider } from "@/shared/hooks/use-habits"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HabitsProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="font-semibold text-lg">Dashboard</h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HabitsProvider>
  )
}
