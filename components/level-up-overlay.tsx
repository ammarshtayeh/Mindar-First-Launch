"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Zap, Award, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function LevelUpOverlay() {
  const [show, setShow] = useState(false)
  const [level, setLevel] = useState(1)
  const { t } = useI18n()

  useEffect(() => {
    let lastLevel = 1
    const stored = localStorage.getItem('user_gamification_data')
    if (stored) {
      lastLevel = JSON.parse(stored).level
    }

    const handleUpdate = (e: any) => {
      const newLevel = e.detail.level
      if (newLevel > lastLevel) {
        setLevel(newLevel)
        setShow(true)
        setTimeout(() => setShow(false), 5000)
      }
      lastLevel = newLevel
    }

    window.addEventListener('gamification_update', handleUpdate)
    return () => window.removeEventListener('gamification_update', handleUpdate)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-6"
        >
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 p-1 rounded-[2.5rem] shadow-[0_0_50px_rgba(250,204,21,0.4)] overflow-hidden">
            <div className="bg-slate-900 rounded-[2.4rem] p-8 text-center relative overflow-hidden">
                {/* Background Sparkles */}
                <div className="absolute inset-0 opacity-20">
                     <Sparkles className="absolute top-4 left-4 w-8 h-8 animate-pulse" />
                     <Sparkles className="absolute bottom-4 right-10 w-12 h-12 animate-pulse delay-75" />
                     <Zap className="absolute top-10 right-4 w-6 h-6 animate-bounce" />
                </div>

                <motion.div
                   animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10"
                >
                   <Star className="w-14 h-14 text-yellow-900 fill-yellow-900" />
                </motion.div>

                <h2 className="text-4xl font-black text-white mb-2 relative z-10">LEVEL UP! 🚀</h2>
                <p className="text-xl font-bold text-yellow-400 mb-4 relative z-10">
                    وصلت للمستوى <span className="text-white text-3xl">{level}</span>
                </p>
                <div className="bg-white/10 px-6 py-2 rounded-2xl inline-block text-white font-black text-sm relative z-10">
                    استمر يا وحش.. المجد بانتظارك! ⚔️
                </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
