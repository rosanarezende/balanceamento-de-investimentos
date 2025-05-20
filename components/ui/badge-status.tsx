import { cn } from "@/lib/utils"

type StatusType = "success" | "warning" | "error" | "info" | "neutral"

interface BadgeStatusProps {
  status: StatusType
  label: string
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
  }

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        statusStyles[status],
        sizeStyles[size],
        className,
      )}
    >
      {label}
    </span>
  )
}
