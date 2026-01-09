"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, Coffee, BookOpen, Bell } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'

export function PomodoroTimer() {
  const { theme } = useTheme()
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'study' | 'break'>('study')
  const [isMinimized, setIsMinimized] = useState(true)
  const [focusTask, setFocusTask] = useState<string | null>(null)

  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = useCallback(() => {
    setIsActive(false)
    if (mode === 'study') {
      setMinutes(25)
    } else {
      setMinutes(5)
    }
    setSeconds(0)
  }, [mode])

  useEffect(() => {
    const handleStartFocus = (e: any) => {
      const taskName = e.detail?.taskName || 'مهمة جديدة'
      setFocusTask(taskName)
      setIsMinimized(false)
      setMode('study')
      setMinutes(25)
      setSeconds(0)
      setIsActive(true)
    }

    window.addEventListener('start-pomodoro-focus', handleStartFocus as EventListener)
    return () => window.removeEventListener('start-pomodoro-focus', handleStartFocus as EventListener)
  }, [])

  const switchMode = () => {
    const newMode = mode === 'study' ? 'break' : 'study'
    setMode(newMode)
    setIsActive(false)
    setMinutes(newMode === 'study' ? 25 : 5)
    setSeconds(0)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        } else if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          // Timer finished
          setIsActive(false)
          new Audio('/notification.mp3').play().catch(() => {}) // Fallback if no file
          alert(mode === 'study' ? `عاشت ايدك! خلصنا تركيز على: ${focusTask || 'المهمة'}` : 'يلا نرجع للدراسة! 📚')
          if (mode === 'study') setFocusTask(null)
          switchMode()
        }
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, minutes, seconds, mode, focusTask])

  if (theme === 'focus' && isMinimized) return null

  return (
    <div className={`fixed bottom-6 left-6 z-50 flex flex-col items-end gap-3`}>
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-card/90 backdrop-blur-xl border-2 border-primary/30 rounded-[2rem] p-6 shadow-2xl w-64"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 max-w-[80%]">
                {mode === 'study' ? (
                  <BookOpen className="w-5 h-5 text-primary" />
                ) : (
                  <Coffee className="w-5 h-5 text-green-500" />
                )}
                <span className="font-black text-sm uppercase tracking-tighter truncate">
                  {focusTask || (mode === 'study' ? 'وقت التركيز' : 'وقت الراحة')}
                </span>
              </div>
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>

            <div className="text-5xl font-black text-center mb-6 font-mono tracking-tighter">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`p-4 rounded-2xl transition-all ${
                  isActive ? 'bg-orange-500/20 text-orange-500' : 'bg-primary text-primary-foreground'
                }`}
              >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-4 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={switchMode}
                className="p-4 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {mode === 'study' ? <Coffee className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMinimized(!isMinimized)}
        className={`
          w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all border-2
          ${mode === 'study' ? 'bg-primary text-primary-foreground border-primary/20' : 'bg-green-500 text-white border-green-400/20'}
          ${isActive ? '' : ''}
        `}
      >
        <Timer className="w-8 h-8" />
        {isActive && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            !
          </div>
        )}
      </motion.button>
    </div>
  )
}
