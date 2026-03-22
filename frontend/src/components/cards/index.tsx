import { ReactNode } from "react"

interface CardsComponentsProps {
  Title: string,
  Total: number,
  Icon: ReactNode,
  NumberColor?: string
}

export function CardsComponents({ Title, Total, Icon, NumberColor }: CardsComponentsProps) {
  return (
    <div className="w-full h-26.5 border rounded-xl border-[#D1D5DB] flex items-center justify-around gap-9">
      <header>
        <h1 className="text-[14px] text-[#45556C]">{Title}</h1>
        <span className={`text-[24px] font-bold`} style={{ color: NumberColor }}>{Total}</span>
      </header>
      {Icon}
    </div>
  )
}
