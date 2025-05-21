import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive bg-destructive/10",
        success: "border-green-500/50 text-green-500 bg-green-500/10",
        warning: "border-yellow-500/50 text-yellow-500 bg-yellow-500/10",
        info: "border-blue-500/50 text-blue-500 bg-blue-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
    title?: string
    icon?: React.ReactNode
  }
>(({ className, variant, title, icon, children, ...props }, ref) => {
  // Determinar o ícone com base na variante
  let defaultIcon = null
  if (!icon) {
    switch (variant) {
      case "destructive":
        defaultIcon = <XCircle className="h-5 w-5" />
        break
      case "success":
        defaultIcon = <CheckCircle className="h-5 w-5" />
        break
      case "warning":
        defaultIcon = <AlertTriangle className="h-5 w-5" />
        break
      case "info":
        defaultIcon = <Info className="h-5 w-5" />
        break
    }
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {(icon || defaultIcon) && (
        <div className="flex items-start">
          <div className="mr-2 mt-0.5">
            {icon || defaultIcon}
          </div>
          <div>
            {title && <h5 className="font-medium mb-1">{title}</h5>}
            <div className="text-sm">{children}</div>
          </div>
        </div>
      )}
      {!icon && !defaultIcon && (
        <>
          {title && <h5 className="font-medium mb-1">{title}</h5>}
          <div className="text-sm">{children}</div>
        </>
      )}
    </div>
  )
})
Alert.displayName = "Alert"

export { Alert, alertVariants }
