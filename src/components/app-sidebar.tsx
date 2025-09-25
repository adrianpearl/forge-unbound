"use client"

import * as React from "react"
import {
  Landmark,
  Vote,
  FileChartColumn
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
const data = {
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
      isActive: false,
      items: [],
    },
    {
      title: "Analytics & Reporting",
      url: "/analytics",
      icon: FileChartColumn,
      isActive: false,
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
  return (
    <Sidebar collapsible="icon" className="admin-font" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
