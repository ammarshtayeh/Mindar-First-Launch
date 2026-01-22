"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const variantsStyles = {
  default:
    "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-500/50",
  destructive:
    "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-red-500/50",
  outline:
    "border border-white/20 bg-transparent hover:bg-white/10 text-white hover:border-white/40",
  ghost: "hover:bg-white/10 text-slate-200",
  secondary:
    "bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700",
};

const sizeStyles = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-12 rounded-lg px-8 text-lg font-semibold",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantsStyles;
  size?: keyof typeof sizeStyles;
  asChild?: boolean;
}

export const buttonVariants = ({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: keyof typeof variantsStyles | null;
  size?: keyof typeof sizeStyles | null;
  className?: string;
} = {}) => {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95",
    variantsStyles[(variant as keyof typeof variantsStyles) || "default"],
    sizeStyles[(size as keyof typeof sizeStyles) || "default"],
    className,
  );
};

import { soundManager } from "@/lib/sound-manager";
import { Slot } from "@radix-ui/react-slot";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      soundManager.play("click");
      if (onClick) onClick(e);
    };

    return (
      <Comp
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
