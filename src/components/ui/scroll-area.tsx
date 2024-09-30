import * as React from "react"
// Remove this line if you're not using @radix-ui/react-scroll-area
// import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "../../lib/utils"

// Replace the ScrollArea component with a simple div for now
const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-auto", className)}
    {...props}
  >
    {children}
  </div>
))
ScrollArea.displayName = "ScrollArea"

// Remove the ScrollBar component if you're not using it

export { ScrollArea }