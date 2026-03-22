"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/src/components/ui/sidebar"

import { cn } from "@/src/lib/utils"

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  // ✔ marca SOMENTE quando for exatamente a rota
  const isExactActive = (url: string) => pathname === url

  // ✔ abre o menu pai apenas se algum filho estiver ativo
  const isChildActive = (children?: { url: string }[]) =>
    children?.some((child) => pathname === child.url) ?? false

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const childActive = isChildActive(item.items)

          /**
           * 🔹 ITEM SEM SUBMENU
           */
          if (!item.items) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      isExactActive(item.url)
                        ? "bg-linear-to-r from-[#2563EB] to-[#0F1E2E] text-white"
                        : "hover:bg-linear-to-r from-[#2563EB] to-[#0F1E2E] hover:text-white"
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "transition-colors",
                          isExactActive(item.url)
                            ? "text-green-400"
                            : "hover:text-white"
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          /**
           * 🔹 ITEM COM SUBMENU
           */
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={childActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      childActive
                        ? "bg-linear-to-r from-[#2563EB] to-[#0F1E2E] text-white"
                        : "hover:bg-linear-to-r from-[#2563EB] to-[#0F1E2E] hover:text-white"
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "transition-colors",
                          childActive
                            ? "text-green-400"
                            : "hover:text-white"
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const subActive = isExactActive(subItem.url)

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={subItem.url}
                              className={cn(
                                "transition-colors",
                                subActive
                                  ? "bg-linear-to-r from-[#2563EB] to-[#0F1E2E] text-white hover:from-[#2563EB] hover:to-[#0F1E2E] hover:text-white"
                                  : "hover:bg-linear-to-r from-[#2563EB] to-[#0F1E2E] hover:text-white"
                              )}
                            >
                              <span
                                className={cn(
                                  "transition-colors",
                                  "text-white"
                                )}
                              >
                                {subItem.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
