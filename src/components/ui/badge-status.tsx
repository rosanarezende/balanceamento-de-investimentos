"use client"

import { cn } from "@/core/utils/styling"

type StatusType = "success" | "warning" | "error" | "info" | "neutral" | "up" | "down"

interface BadgeStatusProps {
  status: StatusType
  label?: string
  className?: string
  size?: "sm" | "md"
}

export function BadgeStatus({ status, label, className, size = "md" }: BadgeStatusProps) {
  const statusStyles = {
    success: "bg-state-success/20 text-state-success border-state-success/30",
    warning: "bg-state-warning/20 text-state-warning border-state-warning/30",
    error: "bg-state-error/20 text-state-error border-state-error/30",
    info: "bg-state-info/20 text-state-info border-state-info/30",
    neutral: "bg-background-tertiary text-text-secondary border-border-secondary",
    up: "bg-green-500/20 text-green-500 border-green-500/30",
    down: "bg-red-500/20 text-red-500 border-red-500/30",
  }

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  }

  // Se não foi fornecido um label, gerar um baseado no status
  const displayLabel = label || (status === "up" ? "↑" : status === "down" ? "↓" : status)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        statusStyles[status],
        sizeStyles[size],
        className ?? "",
      )}
    >
      {displayLabel}
    </span>
  )
}
