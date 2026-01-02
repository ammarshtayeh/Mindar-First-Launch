"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getRandomContent, MotivationalContent } from '@/lib/motivational-content'
import { Sparkles, X } from 'lucide-react'

interface MotivationalBannerProps {
  context?: 'home' | 'upload' | 'quiz' | 'results'
  autoRotate?: boolean
  rotateInterval?: number // in milliseconds
}

export function MotivationalBanner({ 
  context, 
  autoRotate = true, 
  rotateInterval = 10000 
}: MotivationalBannerProps) {
  const [content, setContent] = useState<MotivationalContent | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('motivational-banner-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Set initial content
    setContent(getRandomContent(context))

    // Auto-rotate content if enabled
    if (autoRotate) {
      const interval = setInterval(() => {
        setIsVisible(false)
        setTimeout(() => {
          setContent(getRandomContent(context))
          setIsVisible(true)
        }, 500)
      }, rotateInterval)

      return () => clearInterval(interval)
    }
  }, [context, autoRotate, rotateInterval])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('motivational-banner-dismissed', 'true')
  }

  if (isDismissed || !content) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/30 rounded-3xl p-8 backdrop-blur-sm shadow-lg">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 mt-1">
                <div className="w-16 h-16 rounded-2xl bg-primary/30 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-2xl font-black leading-relaxed">
                  {content.text}
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-3 hover:bg-primary/10 rounded-xl transition-colors"
                title="إخفاء"
              >
                <X className="w-6 h-6 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
