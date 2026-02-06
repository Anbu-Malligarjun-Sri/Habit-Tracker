"use client"

import { Home, Settings, DollarSign, Activity, Code, BookOpen, Trophy } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/shared/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Habits",
        url: "/dashboard/habits",
        icon: Activity,
    },
    {
        title: "Finance",
        url: "/dashboard/finance",
        icon: DollarSign,
    },
    {
        title: "Fitness",
        url: "/dashboard/fitness",
        icon: Activity,
    },
    {
        title: "Journal",
        url: "/dashboard/journal",
        icon: BookOpen,
    },
    {
        title: "Achievements",
        url: "/dashboard/achievements",
        icon: Trophy,
    },
    {
        title: "Developer",
        url: "/dashboard/developer",
        icon: Code,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Life OS</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
