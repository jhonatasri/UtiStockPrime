"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Lock, type LucideIcon } from "lucide-react"

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

// Prefixos de rotas que exigem um evento selecionado
const ROTAS_COM_EVENTO = [
  '/dashboard/gestao/bares',
  '/dashboard/gestao/entradas',
  '/dashboard/gestao/saida',
  '/dashboard/bar',
  '/dashboard/relatorios',
]

function precisaEvento(url: string) {
  return ROTAS_COM_EVENTO.some((prefix) => url.startsWith(prefix))
}

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({ items, hasEvento }: { items: NavItem[]; hasEvento: boolean }) {
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
            const bloqueado = precisaEvento(item.url) && !hasEvento
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild={!bloqueado} disabled={bloqueado} tooltip={bloqueado ? 'Selecione um evento primeiro' : undefined}>
                  {bloqueado ? (
                    <div
                      className="flex items-center gap-2 opacity-40 cursor-not-allowed select-none px-2 py-1.5 rounded-md"
                      title="Selecione um evento primeiro"
                    >
                      {item.icon && <item.icon className="shrink-0" />}
                      <span>{item.title}</span>
                      <Lock className="ml-auto h-3 w-3 shrink-0" />
                    </div>
                  ) : (
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
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          /**
           * 🔹 ITEM COM SUBMENU
           */
          // Verifica se TODOS os subitens precisam de evento
          const todosBloqueados =
            !hasEvento && item.items.every((sub) => precisaEvento(sub.url))

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={childActive && !todosBloqueados}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild={!todosBloqueados} disabled={todosBloqueados}>
                  <SidebarMenuButton
                    tooltip={todosBloqueados ? 'Selecione um evento primeiro' : item.title}
                    disabled={todosBloqueados}
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      todosBloqueados
                        ? "opacity-40 cursor-not-allowed"
                        : childActive
                        ? "bg-linear-to-r from-[#2563EB] to-[#0F1E2E] text-white"
                        : "hover:bg-linear-to-r from-[#2563EB] to-[#0F1E2E] hover:text-white"
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "transition-colors",
                          childActive && !todosBloqueados
                            ? "text-green-400"
                            : "hover:text-white"
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                    {todosBloqueados
                      ? <Lock className="ml-auto h-3 w-3 shrink-0" />
                      : <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    }
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const subActive = isExactActive(subItem.url)
                      const subBloqueado = precisaEvento(subItem.url) && !hasEvento

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild={!subBloqueado}>
                            {subBloqueado ? (
                              <div
                                className="flex items-center gap-2 opacity-40 cursor-not-allowed select-none px-2"
                                title="Selecione um evento primeiro"
                              >
                                <span className="text-white">{subItem.title}</span>
                                <Lock className="ml-auto h-3 w-3 shrink-0 text-white" />
                              </div>
                            ) : (
                              <Link
                                href={subItem.url}
                                className={cn(
                                  "transition-colors",
                                  subActive
                                    ? "bg-linear-to-r from-[#2563EB] to-[#0F1E2E] text-white hover:from-[#2563EB] hover:to-[#0F1E2E] hover:text-white"
                                    : "hover:bg-linear-to-r from-[#2563EB] to-[#0F1E2E] hover:text-white"
                                )}
                              >
                                <span className={cn("transition-colors", "text-white")}>
                                  {subItem.title}
                                </span>
                              </Link>
                            )}
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
