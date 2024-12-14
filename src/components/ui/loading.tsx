import { cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const loadingVariants = cva(
  "flex-1 flex flex-row items-center justify-center bg-muted text-muted-foreground text-sm"
)

export const Loading = React.forwardRef<  
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(loadingVariants(), className)}
    {...props}
  >
    {
      children ?? "Loading..."
    }
  </div>
))
Loading.displayName = "Loading"