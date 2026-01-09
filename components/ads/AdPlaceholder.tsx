"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sparkles, Zap, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdPlaceholderProps {
  variant?: "banner" | "box" | "sidebar"
  className?: string
  label?: string
}

export function AdPlaceholder({ variant = "banner", className, label }: AdPlaceholderProps) {
  const isBanner = variant === "banner"
  const isBox = variant === "box"
  const isSidebar = variant === "sidebar"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 backdrop-blur-sm group hover:border-primary/40 transition-colors",
        isBanner && "w-full h-32 md:h-40 flex items-center justify-center p-6",
        isBox && "w-full aspect-square flex flex-col items-center justify-center p-8",
        isSidebar && "w-full h-[400px] flex flex-col items-center justify-center p-8",
        className
      )}
    >
      {/* Simplified background for performance */}
      <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.05] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
          <Sparkles className="w-3 h-3" />
          <span>{label || "Sponsored Content"}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Zap className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors" />
          <h4 className="text-sm font-black text-muted-foreground uppercase tracking-tighter">
           إعلانك هنا {variant.toUpperCase()}
          </h4>
          <p className="text-[10px] text-muted-foreground/60 font-medium italic">
           خلي مشروعك يوصل بين الطلاب 
          </p>
        </div>
      </div>

      {/* Info Icon for transparency */}
      <div className="absolute bottom-4 right-6 opacity-20 hover:opacity-100 transition-opacity cursor-help">
        <Info className="w-3 h-3 text-muted-foreground" />
      </div>
    </motion.div>
  )
}
