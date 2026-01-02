"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BrainCircuit, 
  BookOpen, 
  Swords, 
  ArrowLeft, 
  FileCheck, 
  Zap,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { voiceManager } from '@/lib/voice-manager'

export default function StudyHub() {
  const { t, language } = useI18n()
  const [quizData, setQuizData] = useState<any>(null)
  const router = useRouter()

  const [activities, setActivities] = useState([
    { name: language === 'ar' ? 'أحمد' : 'Ahmed', action: 'started studying', time: '2m ago' },
    { name: language === 'ar' ? 'سارة' : 'Sara', action: 'completed a quiz', time: '5m ago' },
    { name: language === 'ar' ? 'علي' : 'Ali', action: 'is on fire 🔥', time: '8m ago' }
  ])

  useEffect(() => {
    const stored = localStorage.getItem("currentQuiz")
    if (stored) {
      setQuizData(JSON.parse(stored))
      // Voice Greeting
      setTimeout(() => {
        voiceManager.speakFeedback('hub')
      }, 1000)
    } else {
      router.push('/upload')
    }
  }, [router])

  useEffect(() => {
    const names = language === 'ar' 
        ? ['محمد', 'خالد', 'فاطمة', 'نور', 'يوسف', 'مريم', 'عمر', 'ليلى'] 
        : ['Mike', 'Emma', 'John', 'Sarah', 'David', 'Lisa', 'Tom', 'Anna']
    
    const actions = language === 'ar'
        ? ['بدأ اختبار جديد', 'أنهى مراجعة البطاقات', 'حصل على وسام جديد 🏅', 'يدرس بتركيز عالي 🧠', 'تجاوز مستواك!']
        : ['started a new quiz', 'finished reviewing cards', 'earned a new badge 🏅', 'is studying hard 🧠', 'surpassed your rank!']

    const interval = setInterval(() => {
        const randomName = names[Math.floor(Math.random() * names.length)]
        const randomAction = actions[Math.floor(Math.random() * actions.length)]
        
        setActivities(prev => {
            const newAct = { 
                name: randomName, 
                action: randomAction, 
                time: language === 'ar' ? 'الآن' : 'Just now' 
            }
            // Add a little randomness to when they appear to feel less "robotic"
            return [newAct, ...prev.slice(0, 3)]
        })
    }, Math.random() * 3000 + 3000) // Random interval between 3-6s

    return () => clearInterval(interval)
  }, [language])

  if (!quizData) return null

  const hubItems = [
    {
      key: "common.quiz",
      descKey: "hub.start",
      icon: BrainCircuit,
      color: "from-primary to-primary/60",
      href: "/quiz",
      badgeKey: "CHALLENGE"
    },
    {
      key: "common.flashcards",
      descKey: "common.flashcardsDesc",
      icon: BookOpen,
      color: "from-teal-500 to-teal-700",
      href: "/flashcards",
      badgeKey: "REVIEW"
    },
    {
      key: "common.challenge",
      descKey: "hub.compete",
      icon: Swords,
      color: "from-red-500 to-orange-600",
      href: "/challenge",
      badgeKey: "ONLINE",
      onClick: () => {
        const stored = localStorage.getItem("currentQuiz")
        if (stored) {
          const data = JSON.parse(stored)
          const filtered = data.questions.filter((q: any) => 
            q.type === 'multiple-choice' || q.type === 'true-false'
          )
          localStorage.setItem("challengeQuiz", JSON.stringify({ ...data, questions: filtered }))
        }
      }
    }
  ]

  return (
    <main className="min-h-screen pt-44 pb-20 px-6 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-primary font-black mb-4 bg-primary/10 px-4 py-1.5 rounded-full w-fit"
                >
                    <FileCheck className="w-5 h-5" />
                    <span>{t('hub.success')}</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter"
                >
                    {language === 'ar' ? (
                      <>جاهز <span className="text-primary italic">للدعك</span>؟ 🚀</>
                    ) : (
                      <>Ready for the <span className="text-primary italic">Grind</span>? 🚀</>
                    )}
                </motion.h1>
                <p className="text-xl text-muted-foreground mt-4 font-bold max-w-2xl">
                    {t('hub.subtitle', { title: quizData.title })}
                </p>
            </div>
            
            <Link href="/upload">
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-primary/20 hover:bg-primary/5 gap-2 font-black">
                    <ArrowLeft className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                    {t('hub.change')}
                </Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hubItems.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Link href={item.href}>
                        <Card 
                            onClick={item.onClick}
                            className="group cursor-pointer h-full border-4 border-transparent hover:border-primary/20 transition-all duration-500 rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-xl shadow-2xl hover:scale-[1.02]"
                        >
                            <CardContent className="p-10 flex flex-col h-full">
                                <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-8 shadow-xl group-hover:rotate-12 transition-transform duration-500`}>
                                    <item.icon className="w-10 h-10" />
                                </div>
                                
                                <div className="space-y-4 mb-10 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-3xl font-black">{t(item.key)}</h3>
                                        <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-lg uppercase">
                                            {item.badgeKey}
                                        </span>
                                    </div>
                                    <p className="text-lg text-muted-foreground leading-snug font-bold">
                                        {t(item.descKey)}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                    <span className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                        {t('hub.start')} <Zap className="w-4 h-4 fill-primary" />
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <ArrowLeft className={`w-5 h-5 ${language === 'en' ? '-rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>
            ))}
        </div>

        {/* Stats Preview Card */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-primary/10 backdrop-blur-3xl p-10 rounded-[3rem] border-2 border-primary/20 shadow-3xl text-foreground relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                <Sparkles className="w-64 h-64" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                <div className="space-y-4">
                    <h2 className="text-4xl font-black flex items-center gap-4">
                        <BarChart3 className="text-primary w-10 h-10" />
                        {t('hub.compete')}
                    </h2>
                    <p className="text-xl text-muted-foreground font-bold max-w-xl">
                        {t('hub.discovery', { 
                          questions: quizData.questions?.length || 0, 
                          flashcards: quizData.flashcards?.length || 0 
                        })}
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-background/50 p-6 rounded-[2rem] border border-border/50 backdrop-blur-md">
                    <div className="text-left">
                        <p className="text-xs text-muted-foreground font-black uppercase">{t('hub.rewards')}</p>
                        <p className="text-3xl font-black text-primary">+{quizData.questions?.length * 50} XP</p>
                    </div>
                    <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Zap className="w-8 h-8 fill-primary-foreground" />
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
 
      {/* Peer Radar & Global Leaderboard (New) */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center animate-pulse">
                        <Zap className="w-6 h-6 fill-green-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black">{t('radar.title')}</h3>
                        <p className="text-sm font-bold opacity-60">{t('radar.online', { count: 12 })}</p>
                    </div>
                </div>
                <div className="flex -space-x-4">
                   {[1,2,3,4,5].map(i => (
                       <div key={i} className={`w-10 h-10 rounded-full border-2 border-background bg-slate-${i*100+200} flex items-center justify-center font-black text-[10px]`}>
                           {String.fromCharCode(64 + i)}
                       </div>
                   ))}
                </div>
            </div>
 
            <div className="space-y-4 h-[220px] overflow-hidden relative">
                <AnimatePresence mode='popLayout'>
                    {activities.map((act, i) => (
                        <motion.div 
                            key={`${act.name}-${act.time}-${i}`}
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className="flex items-center justify-between p-4 bg-background/30 rounded-2xl border border-border/50 group hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                                    {act.name[0]}
                                </div>
                                <p className="font-bold text-sm truncate max-w-[180px]">
                                    <span className="text-primary">{act.name}</span> {act.action}
                                </p>
                            </div>
                            <span className="text-[10px] font-black opacity-40 italic shrink-0">{act.time}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
            </div>
        </motion.div>
 
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary/5 backdrop-blur-3xl border-2 border-primary/20 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center justify-center text-center relative"
        >
            <div className="absolute top-4 right-6 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">LIVE</div>
            <div className="w-24 h-24 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 transform rotate-12">
                <BarChart3 className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black mb-2">{t('results.legendary')}</h3>
            <p className="text-sm font-bold opacity-60 mb-6">{t('radar.beFirst')}</p>
            <Button className="w-full h-14 rounded-2xl font-black group overflow-hidden relative">
                <span className="relative z-10">{t('common.challenge')}</span>
                <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </Button>
        </motion.div>
      </div>
    </main>
  )
}
