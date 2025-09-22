import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60 active:scale-95 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:scale-[1.02]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-xl hover:scale-[1.02]",
        outline:
          "border border-input bg-background/90 shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-[1.02]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:scale-[1.02]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover:scale-[1.01]",
        liquid: "liquid-glass text-foreground hover:liquid-glass-strong hover:-translate-y-1 shadow-glass border-0",
        "liquid-primary": "liquid-glass bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-foreground hover:liquid-glass-strong hover:-translate-y-1 shadow-neon border-0",
        "liquid-glow": "liquid-glass-strong text-foreground hover:liquid-glass-tertiary hover:-translate-y-1 shadow-neon border-0 shimmer",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-9",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
