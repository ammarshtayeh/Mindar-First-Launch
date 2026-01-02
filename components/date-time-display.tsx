"use client"

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Calendar, Clock } from 'lucide-react'

export function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) return null

  // Format date in Arabic
  const formattedDate = format(currentTime, 'EEEE، d MMMM yyyy', { locale: ar })
  const formattedTime = format(currentTime, 'hh:mm:ss a', { locale: ar })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 text-sm font-bold">
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-sm">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-foreground">{formattedDate}</span>
      </div>
      
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-sm">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-foreground font-mono">{formattedTime}</span>
      </div>
    </div>
  )
}
