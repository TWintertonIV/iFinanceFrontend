"use client"

import { type LucideIcon } from "lucide-react"

import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator"

export function NavMain(
  {
    items,
    state,
  }: {
    items?: {
      title: string
      url?: string
      icon: LucideIcon
    }[]
    state: string
  }
) {
  return (
    <SidebarGroupContent>
      <Separator />
      <SidebarMenu>
        {items?.map((item) => (
            // Simple menu item (e.g. for Settings)
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-white/10 transition-colors">
                <a href={item.url} className={state === "expanded" ? "flex items-center gap-2" : "flex items-center gap-2 ml-2"}>
                  {
                  state === "expanded" &&
                    item.icon && <item.icon className="text-blue-400" />
                  }
                  {
                  state === "collapsed" &&
                    item.icon && <item.icon className="text-blue-400 inline-block" />
                  }
                  <span className="text-gray-200">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
      <Separator className="my-4 bg-border" />
    </SidebarGroupContent>
  )
}
