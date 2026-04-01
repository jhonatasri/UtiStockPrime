"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar"

import Icon from '@/public/icon.svg'
import Image from "next/image"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    id?: number
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()

  const [activeTeam, setActiveTeam] = React.useState(() => {
    if (typeof window === 'undefined') return teams[0]
    const saved = localStorage.getItem('selected-team')
    return teams.find(t => t.name === saved) ?? teams[0]
  })

  React.useEffect(() => {
    const saved = localStorage.getItem('selected-team')
    const found = teams.find(t => t.name === saved)
    if (found) {
      setActiveTeam(found)
      if (found.id != null) localStorage.setItem('selected-team-id', String(found.id))
    }
  }, [teams])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-white text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {/* <activeTeam.logo className="size-4" /> */}
                <Image
                  src={Icon}
                  alt="icon"
                  width={200}
                  height={200}
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Eventos
            </DropdownMenuLabel>
            {teams.slice(1).map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => {
                setActiveTeam(team)
                localStorage.setItem('selected-team', team.name)
                if (team.id != null) localStorage.setItem('selected-team-id', String(team.id))
                else localStorage.removeItem('selected-team-id')
              }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
