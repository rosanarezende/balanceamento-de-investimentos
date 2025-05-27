import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingState({ message = "Carregando...", fullScreen = false, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-text-secondary",
        fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className,
      )}
    >
      <LoadingSpinner size="lg" className="mb-4" />
      <p>{message}</p>
    </div>
  )
}
