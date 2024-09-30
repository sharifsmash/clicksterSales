import * as React from "react"
// Remove this line if you're not using @radix-ui/react-switch
// import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "../../lib/utils"

// Replace the Switch component with a simple checkbox for now
const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    className={cn(
      "peer h-[24px] w-[44px] cursor-pointer appearance-none rounded-full bg-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary",
      className
    )}
    ref={ref}
    {...props}
  />
))
Switch.displayName = "Switch"

export { Switch }