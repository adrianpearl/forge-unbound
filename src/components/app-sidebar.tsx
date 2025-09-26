"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import {
  Landmark,
  Vote,
  FileChartColumn,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Campaign admin dashboard data
const baseData = {
  user: {
    name: "Campaign Admin",
    email: "admin@sarahjohnsonforsenate.com",
    avatar: "/avatars/campaign-admin.jpg",
  },
  teams: [
    {
      name: "Campaign Admin",
      logo: Landmark,
      plan: "Pro",
    },
  ],
  navMain: [
    {
      title: "Action Portals",
      url: "/",
      icon: Vote,
      items: [],
    },
    {
      title: "Analytics & Reporting",
      url: "/analytics",
      icon: FileChartColumn,
      badge: {
        text: "Coming",
        variant: "secondary"
      },
      items: [],
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  
  // Add active state dynamically based on current route
  const navMainWithActiveState = baseData.navMain.map(item => ({
    ...item,
    isActive: location.pathname === item.url
  }))
  
  return (
    <Sidebar collapsible="icon" className="admin-font" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={baseData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActiveState} />
        {false && <NavProjects projects={baseData.projects} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={baseData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
