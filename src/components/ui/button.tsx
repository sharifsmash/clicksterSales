import * as React from "react"
// Remove this line if you're not using @radix-ui/react-slot
// import { Slot } from "@radix-ui/react-slot"
// Remove this line if you're not using class-variance-authority
// import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

// Remove or comment out the buttonVariants definition if you're not using class-variance-authority

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: string
  size?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'button' : "button"
    return (
      <Comp
        className={cn(className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }