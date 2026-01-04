"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flashcards } from '@/components/flashcards'
import { Loader2, ArrowLeft, BookOpen, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export default function FlashcardsPage() {
  const { t, language } = useI18n()
  const { currentQuiz } = useSelector((state: RootState) => state.quiz)
  const [quizData, setQuizData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const handleSync = () => {
      if (currentQuiz) {
        setQuizData(currentQuiz)
        setLoading(false)
      } else {
        const stored = localStorage.getItem("currentQuiz")
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setQuizData(parsed)
          } catch (e) {
            console.error("Flashcards: Failed to parse stored quiz", e)
          }
        }
        setLoading(false)
      }
    }

    handleSync()
  }, [currentQuiz])

  // Normalize flashcards data: keys from API are front/back, component expects question/answer
  const cards = React.useMemo(() => {
    if (!quizData) return []
    
    // 1. Try dedicated flashcards field
    if (quizData.flashcards && Array.isArray(quizData.flashcards) && quizData.flashcards.length > 0) {
      return quizData.flashcards.map((f: any) => ({
        question: f.front || f.question || "---",
        answer: f.back || f.answer || "---",
        explanation: f.explanation || ''
      }))
    }
    
    // 2. Fallback to questions
    if (quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
      return quizData.questions.map((q: any) => ({
        question: q.question || "---",
        answer: q.answer || "---",
        explanation: q.explanation || ''
      }))
    }
    
    return []
  }, [quizData])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-xl font-bold animate-pulse">{t('common.loading')}</p>
      </div>
    )
  }

  if (!quizData || cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-8 text-slate-400">
          <BookOpen className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black mb-4">{language === 'ar' ? 'ما في بطاقات لسه! 🗂️' : 'No flashcards yet! 🗂️'}</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">{language === 'ar' ? 'ارفع ملف واعمل كويز عشان نولّدلك بطاقات مراجعة أسطورية.' : 'Upload a file and create a quiz to generate legendary review cards.'}</p>
        <Link href="/hub">
          <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl">
            {t('common.upload')}
          </Button>
        </Link>
      </div>
    )
  }
  return (
    <main className="min-h-screen pt-44 pb-20 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 h-[calc(100vh-12rem)] flex flex-col">
        <div className="flex items-center justify-between mb-8">
             <Link href="/hub">
                <Button variant="outline" className="h-12 px-6 rounded-xl border-2 border-primary/20 bg-background/80 text-primary hover:bg-primary hover:text-primary-foreground backdrop-blur-md transition-all gap-2 font-black">
                    <ArrowLeft className={`w-5 h-5 ${language === 'en' ? '' : 'rotate-180'}`} />
                    {t('common.back')}
                </Button>
            </Link>
            <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                <Zap className="w-5 h-5 text-primary fill-primary" />
                <span className="font-black text-primary uppercase tracking-widest text-[10px]">MINDAR</span>
            </div>
             <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {t('common.flashcards')}: {quizData.title}
             </h1>
        </div>

        <div className="flex-1 relative">
            <Flashcards 
                cards={cards}
                isOpen={true}
                isInline={true}
                onClose={() => router.push('/')}
            />
        </div>
      </div>
    </main>
  )
}
