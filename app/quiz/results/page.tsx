"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Award, 
  RotateCcw, 
  ArrowLeft, 
  Download, 
  Share2, 
  FileText,
  Flame,
  Star,
  Trophy,
  History,
  Sword,
  BookOpen,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { Flashcards } from '@/components/flashcards'
import { GamificationEngine } from '@/lib/gamification'

export default function ResultsPage() {
  const { t, language } = useI18n()
  const [data, setData] = useState<any>(null)
  const [topics, setTopics] = useState<any[]>([])
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [newLevel, setNewLevel] = useState(1)
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("lastQuizResults")
    if (stored) {
      const results = JSON.parse(stored)
      setData(results)
      
      const topicMap: Record<string, { total: number; correct: number }> = {}
      results.questions.forEach((q: any, idx: number) => {
        const topic = q.topic || 'عام'
        if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0 }
        topicMap[topic].total++
        if (results.answers[idx]?.isCorrect) topicMap[topic].correct++
      })

      const topicPerf = Object.entries(topicMap).map(([topic, stats]) => ({
        topic,
        score: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100)
      }))
      setTopics(topicPerf)

      // Calculate and award XP
      const xp = GamificationEngine.calculateQuizXP(results.score, results.total, 120); // Dummy time for now
      const updatedData = GamificationEngine.addXP(xp);
      setEarnedXP(xp);
      setNewLevel(updatedData.level);
      setUnlockedBadges(updatedData.badges.filter((b: any) => (Date.now() - b.unlockedAt) < 10000)); // Show recently unlocked

      // Check for badges
      if (results.score === results.total) {
        GamificationEngine.unlockBadge('perfect_score');
      }
      if (results.score > 0) {
        GamificationEngine.unlockBadge('first_win');
      }
    }
  }, [])

  if (!data) return null

  const percentage = Math.round((data.score / data.total) * 100)

  const handleRevengeRound = () => {
    // Filter questions that were wrong or skipped
    const wrongQuestions = data.questions.filter((q: any, idx: number) => !data.answers[idx]?.isCorrect)
    
    if (wrongQuestions.length === 0) {
      alert(t('results.noMistakes'))
      return
    }

    const revengeQuiz = {
      title: `Revenge Round: ${data.title}`,
      questions: wrongQuestions,
      vocabulary: data.vocabulary || []
    }

    localStorage.setItem("currentQuiz", JSON.stringify(revengeQuiz))
    router.push('/quiz')
  }

  // Prepare flashcards data: prioritize generated ones or fallback to questions
  const flashcardsData = data.flashcards 
    ? data.flashcards.map((f: any) => ({
        question: f.front || f.question,
        answer: f.back || f.answer,
        explanation: f.explanation || ''
      }))
    : data.questions.map((q: any) => ({
        question: q.question,
        answer: q.answer,
        explanation: q.explanation
      }))

  return (
    <main className="min-h-screen pt-40 px-6 bg-background font-cairo overflow-x-hidden pb-32">
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-10 py-12">
        {/* Flashcards Component */}
        <Flashcards 
            cards={flashcardsData}
            isOpen={isFlashcardsOpen}
            onClose={() => setIsFlashcardsOpen(false)}
        />

        {/* Hero Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl glow-primary"
          >
            <Trophy className="w-16 h-16 text-primary-foreground" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-3 bg-yellow-400/10 border border-yellow-400/20 px-6 py-2 rounded-full mx-auto w-fit shadow-lg"
          >
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-xl font-black text-yellow-600">
                {t('results.xpEarned', { xp: earnedXP, level: newLevel })}
            </span>
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter">
              {percentage >= 90 ? t('results.legendary') : percentage >= 70 ? t('results.wellDone') : t('results.keepGoing')}
            </h1>
            <p className="text-2xl text-muted-foreground font-bold">
              {t('results.completed', { title: data.title })}
            </p>
            <div className="pt-4">
              <Link href="/upload">
                <Button 
                  variant="outline" 
                  className="h-14 px-8 rounded-2xl border-primary bg-primary/5 text-primary hover:bg-primary hover:text-white gap-2 font-black transition-all hover:scale-105 shadow-lg group"
                >
                  <RotateCcw className={`w-5 h-5 transition-transform group-hover:rotate-180 ${language === 'en' ? 'rotate-180' : ''}`} />
                  {t('hub.change')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recently Unlocked Badges */}
        <AnimatePresence>
          {unlockedBadges.length > 0 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-wrap justify-center gap-4 bg-primary/5 p-6 rounded-[2.5rem] border-2 border-dashed border-primary/20"
            >
              <div className="w-full text-center mb-2">
                 <span className="text-xs font-black uppercase text-primary tracking-widest">أوسمة جديدة! 🎖️</span>
              </div>
              {unlockedBadges.map(badge => (
                <motion.div 
                  key={badge.id}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-border"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="text-left">
                    <p className="font-black text-sm leading-none">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={handleRevengeRound}
                className="cursor-pointer bg-gradient-to-br from-red-500 to-orange-600 p-8 rounded-[3rem] text-white shadow-xl group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                    <Sword className="w-32 h-32" />
                </div>
                <h3 className="text-4xl font-black mb-2">{t('common.revenge')}</h3>
                <p className="text-xl opacity-90 font-bold">{t('common.revengeDesc')}</p>
                <div className="mt-8 bg-white/20 inline-block px-6 py-2 rounded-full font-black">{t('common.revengeBtn')}</div>
            </motion.div>

            <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsFlashcardsOpen(true)}
                className="cursor-pointer bg-gradient-to-br from-primary to-primary/80 p-8 rounded-[3rem] text-white shadow-xl group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-32 h-32" />
                </div>
                <h3 className="text-4xl font-black mb-2">{t('common.flashcards')} 🗂️</h3>
                <p className="text-xl opacity-90 font-bold">{t('common.flashcardsDesc')}</p>
                <div className="mt-8 bg-white/20 inline-block px-6 py-2 rounded-full font-black">{t('common.flashcardsBtn')}</div>
            </motion.div>
        </div>

        {/* Core Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -5 }} className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] text-center shadow-lg">
            <p className="text-muted-foreground font-black text-sm uppercase mb-2">{t('common.score')}</p>
            <p className="text-6xl font-black text-primary">{percentage}%</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] text-center shadow-lg">
            <p className="text-muted-foreground font-black text-sm uppercase mb-2">{t('common.correct')}</p>
            <p className="text-6xl font-black text-green-500">{data.score} / {data.total}</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] text-center shadow-lg">
            <p className="text-muted-foreground font-black text-sm uppercase mb-2">{t('common.date')}</p>
            <p className="text-3xl font-black text-primary mt-4">
                {new Date(data.timestamp).toLocaleDateString()}
            </p>
          </motion.div>
        </div>

        {/* Analytics Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Flame className="w-10 h-10 text-orange-500" />
            <h2 className="text-4xl font-black">{t('common.performance')}</h2>
          </div>
          <AnalyticsDashboard 
            topicPerformance={topics} 
            overallScore={data.score} 
            totalQuestions={data.total} 
          />
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10">
          <Link href="/upload">
            <Button size="lg" className="w-full h-20 text-xl font-black rounded-2xl bg-primary text-primary-foreground shadow-xl">
              <RotateCcw className="mr-2 w-5 h-5" /> {t('common.newQuiz')}
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full h-20 text-xl font-black rounded-2xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">
            <Download className="mr-2 w-5 h-5" /> {t('common.export')}
          </Button>
          <Button size="lg" className="w-full h-20 text-xl font-black rounded-2xl bg-secondary text-white hover:bg-secondary/90 shadow-xl border-b-4 border-secondary/50 active:border-b-0 active:translate-y-1 transition-all">
            <Share2 className="mr-2 w-5 h-5" /> {t('common.share')}
          </Button>
          <Link href="/">
            <Button variant="ghost" size="lg" className="w-full h-20 text-xl font-black rounded-2xl text-muted-foreground hover:bg-muted/50 hover:text-foreground">
              <ArrowLeft className="mr-2 w-5 h-5" /> {t('common.homeBtn')}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
