"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Home, ClipboardList, BookOpen, BrainCircuit, Swords, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from "@/components/theme-toggle"
import { DateTimeDisplay } from "@/components/date-time-display"
import { GamificationEngine } from '@/lib/gamification'
import { useI18n } from '@/lib/i18n'
import { Languages, Volume2, VolumeX } from 'lucide-react'
import { LevelUpOverlay } from './level-up-overlay'
import { voiceManager } from '@/lib/voice-manager'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { toggleVoice, setLanguage } from '@/redux/slices/settingsSlice'

const navItems = [
  { key: 'common.home', href: '/', icon: Home },
  { key: 'common.quiz', href: '/quiz', icon: BrainCircuit },
  { key: 'common.flashcards', href: '/flashcards', icon: BookOpen },
  { key: 'common.challenge', href: '/challenge', icon: Swords },
  { key: 'common.todo', href: '/todo', icon: ClipboardList },
]

export function Navbar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const dispatch = useDispatch()
  
  // Redux State
  const { level, xp } = useSelector((state: RootState) => state.gamification)
  const { hasData } = useSelector((state: RootState) => state.quiz)
  const { voiceEnabled, language } = useSelector((state: RootState) => state.settings)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const nextLevelXP = Math.pow(level, 2) * 50
  const currentLevelXP = Math.pow(level - 1, 2) * 50
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

  const toggleVoiceHandler = () => {
    dispatch(toggleVoice())
    voiceManager.toggleMasterEnabled()
  }

  const setLanguageHandler = (lang: 'ar' | 'en') => {
    dispatch(setLanguage(lang))
    // We also need to update the i18n context if possible, or refactor i18n to use Redux totally. 
    // For now, let's keep the hook for translation text but sync checking.
  }

  return (
    <>
    <LevelUpOverlay />
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-primary/10 shadow-xl transition-all duration-500">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        
        {/* Right Section: Logo & Time & XP */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl border-2 border-primary/20 overflow-hidden glow-primary relative">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain pointer-events-none"
                onError={(e) => {
                  (e.target as any).style.display = 'none';
                  (e.target as any).nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="hidden absolute inset-0 items-center justify-center bg-gradient-to-tr from-primary to-primary/60 text-white"
                style={{ display: 'none' }}
              >
                 <BrainCircuit className="w-8 h-8" />
              </div>
            </div>
            <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary leading-none">
                    {t('home.title')}
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest text-primary/60 hidden md:block mt-1">
                    Interactive Learning Space
                </span>
            </div>
          </Link>
          
          <div className="hidden xl:flex items-center gap-4 bg-primary/5 dark:bg-primary/10 px-4 py-2 rounded-2xl border border-primary/10 backdrop-blur-md">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                <Star className="text-white w-6 h-6 fill-white" />
                <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {isMounted ? level : 1}
                </span>
            </div>
            <div className="flex flex-col gap-1.5 w-32">
                <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        XP {xp}
                    </span>
                    <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                    />
                </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <DateTimeDisplay />
          </div>
        </div>

        <ul className="flex items-center gap-1 sm:gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 text-sm sm:text-base font-black",
                    isActive 
                      ? "text-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                      : (!hasData && (item.key === 'common.quiz' || item.key === 'common.flashcards'))
                        ? "text-muted-foreground/30 pointer-events-none"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden xl:block">{t(item.key)}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 border-2 border-primary/20 rounded-2xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Left Section: Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2 bg-yellow-400/20 px-3 py-1.5 rounded-xl border border-yellow-400/30">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-black text-yellow-600">{level}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoiceHandler}
            className={cn(
                "w-12 h-12 rounded-2xl transition-all active:scale-95 group relative",
                voiceEnabled ? "hover:bg-primary/10 text-primary" : "hover:bg-red-500/10 text-muted-foreground"
            )}
            title={voiceEnabled ? t('common.voiceEnabled') : t('common.voiceDisabled')}
          >
            {voiceEnabled ? (
                <Volume2 className="w-6 h-6 animate-pulse" />
            ) : (
                <VolumeX className="w-6 h-6" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="w-12 h-12 rounded-2xl hover:bg-primary/10 transition-all active:scale-95"
            title={language === 'ar' ? 'English' : 'العربية'}
          >
            <Languages className="w-6 h-6 text-muted-foreground" />
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </nav>
    </>
  )
}
