"use client"

import type { ReactNode } from "react"
import { cn } from "@/core/utils"

interface CardGlassProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
  onClick?: () => void
}

export function CardGlass({ children, className, hoverEffect = false, onClick }: CardGlassProps) {
  return (
    <div
      className={cn("glassmorphism rounded-xl p-4", hoverEffect && "card-hover cursor-pointer", className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
