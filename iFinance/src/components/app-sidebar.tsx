import * as React from "react"
import {
  Settings2,
  ChartBar,
  BadgeDollarSign,
  ClipboardPlus,
  LayoutDashboard
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"

const tokenString = localStorage.getItem("token");
const userToken = JSON.parse(tokenString || "{}")
// This is sample data.
const data = {
  user: {
    name: userToken?.name,
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/Dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Manage Account Group",
      url: "/ManageAccountGroup",
      icon: Settings2
    },
    {
      title: "Chart Of Accounts",
      url: "/ChartOfAccounts",
      icon: ChartBar
    },
    {
      title: "Double Entry Transactions",
      url: "/DoubleEntryTransactions",
      icon: BadgeDollarSign
    },
    {
      title: "Reports",
      url: "/Reports",
      icon: ClipboardPlus
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    state,
  } = useSidebar()
  return (
    <Sidebar className="select-none" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarGroupLabel className="flex justify-center items-center pt-5 pr-37 text-lg font-size-15">iFinance</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} state={state} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
