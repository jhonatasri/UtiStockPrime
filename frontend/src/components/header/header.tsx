'use client'

import { usePathname } from "next/navigation"
import * as LucideIcons from "lucide-react"
import { LayoutDashboard, type LucideIcon } from "lucide-react"
import { useListaRotas } from "@/src/http/generated/rotas/rotas"
import { SidebarTrigger, useSidebar } from "@/src/components/ui/sidebar"

export function Header() {
  const pathname = usePathname()
  const { data: rotas } = useListaRotas()
  const { isMobile } = useSidebar()

  const rota = rotas?.find((r) => r.rota === pathname)

  const Icon = rota?.logo
    ? ((LucideIcons[rota.logo as keyof typeof LucideIcons] as LucideIcon) ?? LayoutDashboard)
    : LayoutDashboard

  const title = rota?.titulo ?? "Dashboard"
  const subtitle = rota?.descricao ?? ""

  return (
    <header className="w-full max-h-41.25 p-5 text-white bg-linear-to-r from-[#0F1E2E] to-[#306194]">
      <section className="grid grid-cols-1 items-start">
        <div className="flex items-center gap-3">
          {isMobile && (
            <SidebarTrigger className="text-white hover:bg-white/10 mr-1" />
          )}
          <Icon color="#7CBC9E" size={32} />
          <h1 className="font-bold text-[30px]">{title}</h1>
        </div>
        {subtitle && (
          <span className="text-[14px]">{subtitle}</span>
        )}
      </section>
    </header>
  )
}
