"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

// Combine standard button props with motion props loosely
// We use motion.button, so it accepts motion props.
type CombinedProps = ButtonProps & HTMLMotionProps<"button">;

export const Button = React.forwardRef<HTMLButtonElement, CombinedProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    
    // Aesthetic Variants
    const variantsStyles = {
        default: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-500/50",
        outline: "border border-white/20 bg-transparent hover:bg-white/10 text-white hover:border-white/40",
        ghost: "hover:bg-white/10 text-slate-200",
        secondary: "bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700"
    }

    const sizeStyles = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-lg font-semibold",
        icon: "h-10 w-10"
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(37,99,235,0.5)" }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantsStyles[variant as keyof typeof variantsStyles],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
