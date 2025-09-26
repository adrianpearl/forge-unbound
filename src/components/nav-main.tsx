import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Helper function to get badge variant classes
function getBadgeVariantClass(variant?: string) {
  switch (variant) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'warning':
      return 'bg-yellow-500 text-black'
    case 'destructive':
      return 'bg-red-500 text-white'
    case 'secondary':
      return 'bg-transparent text-sidebar-foreground/70 border border-sidebar-border'
    default:
      return 'bg-blue-500 text-white'
  }
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    defaultOpen?: boolean
    badge?: {
      text: string
      variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
    }
    items?: {
      title: string
      url: string
      isActive?: boolean
      badge?: {
        text: string
        variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
      }
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // If item has subitems, render as collapsible
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.defaultOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.badge && (
                    <SidebarMenuBadge className={getBadgeVariantClass(item.badge.variant)}>
                      {item.badge.text}
                    </SidebarMenuBadge>
                  )}
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                          {subItem.badge && (
                            <SidebarMenuBadge className={getBadgeVariantClass(subItem.badge.variant)}>
                              {subItem.badge.text}
                            </SidebarMenuBadge>
                          )}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }
          
          // Otherwise, render as direct link
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.badge && (
                <SidebarMenuBadge className={getBadgeVariantClass(item.badge.variant)}>
                  {item.badge.text}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
