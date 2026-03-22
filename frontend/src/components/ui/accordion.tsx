'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface AccordionProps {
  type?: 'single' | 'multiple'
  children: React.ReactNode
  className?: string
}

interface AccordionContextValue {
  openItems: string[]
  toggle: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: [],
  toggle: () => {},
})

function Accordion({ type = 'single', children, className }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([])

  const toggle = (value: string) => {
    if (type === 'multiple') {
      setOpenItems(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    } else {
      setOpenItems(prev => (prev.includes(value) ? [] : [value]))
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div
      data-value={value}
      className={cn('rounded-lg border border-gray-200 bg-gray-50 overflow-hidden', className)}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ value?: string }>, { value })
        }
        return child
      })}
    </div>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  value?: string
}

function AccordionTrigger({ children, className, value }: AccordionTriggerProps) {
  const { openItems, toggle } = React.useContext(AccordionContext)
  const isOpen = value ? openItems.includes(value) : false

  return (
    <button
      type="button"
      onClick={() => value && toggle(value)}
      className={cn(
        'flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-left text-gray-800 hover:bg-gray-100 transition-colors',
        className
      )}
    >
      {children}
      <ChevronDown
        size={16}
        className={cn('text-gray-400 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
      />
    </button>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  value?: string
}

function AccordionContent({ children, className, value }: AccordionContentProps) {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = value ? openItems.includes(value) : false

  if (!isOpen) return null

  return (
    <div className={cn('border-t border-gray-200 bg-white px-4 py-3', className)}>
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
