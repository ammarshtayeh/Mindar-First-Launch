"use client"

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export const CreativeEmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="relative mb-8">
        {/* Animated background rings */}
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 -m-8 rounded-full bg-primary/20 blur-2xl"
        />
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary relative z-10 border border-primary/20 shadow-inner">
          <Icon className="w-12 h-12" />
        </div>
      </div>
      
      <div className="max-w-xs mx-auto space-y-3">
        <h3 className="text-2xl font-black text-foreground tracking-tight">{title}</h3>
        <p className="text-muted-foreground font-bold leading-relaxed">{description}</p>
      </div>

      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </motion.div>
  )
}
