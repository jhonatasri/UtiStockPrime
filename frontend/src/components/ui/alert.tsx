import * as React from "react"
import { cn } from "@/src/lib/utils"

function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-start gap-2 [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription }
