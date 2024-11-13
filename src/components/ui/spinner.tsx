import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import * as React from "react";

const Spinner = React.forwardRef<
  React.ElementRef<typeof Loader2>,
  React.ComponentPropsWithoutRef<typeof Loader2>
>(({ className, ...props }, ref) => (
  <Loader2
    ref={ref}
    className={cn("mr-2 h-4 w-4 animate-spin", className)}
    {...props}
  />
));
Spinner.displayName = "Spinner";

export { Spinner };
