"use client"

import * as React from "react"
import { useEventoSelecionado } from "@/src/hooks/useEventoSelecionado"
import { GalleryVerticalEnd, LayoutDashboard, CalendarCheck, type LucideIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/src/components/ui/sidebar"
import { TeamSwitcher } from "./teamSwitcher"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { AuthContext } from "@/src/providers/AuthContext"
import { useListaRotasPorUsuario } from "@/src/http/generated/rotas-usuários/rotas-usuários"
import { useListaEventos } from "@/src/http/generated/eventos/eventos"

const defaultTeam = {
  name: "Uti Stock",
  logo: GalleryVerticalEnd,
  plan: "Prime",
}

function resolveIcon(name: string): LucideIcon {
  return (LucideIcons[name as keyof typeof LucideIcons] as LucideIcon) ?? LayoutDashboard
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = React.useContext(AuthContext)
  const { state } = useSidebar()
  const userId = Number(user?.usuario.id)
  const { data: rotas } = useListaRotasPorUsuario(userId, {
    query: { enabled: !!userId },
  })
  const { data: eventos } = useListaEventos(
    { usuarioId: userId },
    { query: { enabled: !!userId } },
  )

  const { eventoId: selectedEventoId } = useEventoSelecionado()
  const hasEvento = !!selectedEventoId

  const teams = React.useMemo(() => {
    const eventTeams = (eventos ?? [])
      .filter((e) => e.ativo)
      .map((e) => ({
        id: e.id,
        name: e.nome,
        logo: CalendarCheck,
        plan: e.categoria,
      }))
    return [defaultTeam, ...eventTeams]
  }, [eventos])

  const navMain = React.useMemo(() => {
    if (!rotas) return []

    const semModulo = rotas
      .filter((r) => !r.modulo)
      .map((r) => ({
        title: r.titulo,
        url: r.rota,
        icon: resolveIcon(r.logo),
      }))

    const modulos = rotas
      .filter((r) => !!r.modulo)
      .reduce<Record<string, typeof rotas>>((acc, r) => {
        const key = r.modulo!
        acc[key] = acc[key] ? [...acc[key], r] : [r]
        return acc
      }, {})

    const comModulo = Object.entries(modulos).map(([modulo, items]) => ({
      title: modulo,
      url: "#",
      icon: resolveIcon(items[0].logo),
      items: items.map((r) => ({
        title: r.titulo,
        url: r.rota,
      })),
    }))

    return [...semModulo, ...comModulo]
  }, [rotas])

  return (
    <Sidebar collapsible="icon" {...props} className="border-r-0 !border-none">
      <SidebarHeader className="bg-[#0f1e2e] text-white">
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent className="bg-[#0f1e2e] text-white font-semibold">
        <NavMain items={navMain} hasEvento={hasEvento} />
      </SidebarContent>

      <SidebarFooter className="bg-[#0f1e2e] text-white">
        <NavUser user={{
          avatar: '',
          email: user?.usuario.email || "",
          name: user?.usuario.nome || "",
        }} />

        <footer className="flex items-center justify-between px-2">
          {state === "expanded" && <span className="text-[12px]">Versão 1.0.0</span>}
          <SidebarTrigger />
        </footer>
      </SidebarFooter>
    </Sidebar>
  )
}
