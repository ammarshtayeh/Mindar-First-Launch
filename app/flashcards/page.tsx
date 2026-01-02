"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flashcards } from '@/components/flashcards'
import { Loader2, ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function FlashcardsPage() {
  const { t, language } = useI18n()
  const [quizData, setQuizData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("currentQuiz")
    if (stored) {
      try {
        setQuizData(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse quiz data", e)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-xl font-bold animate-pulse">{t('common.loading')}</p>
      </div>
    )
  }

  if (!quizData || (!quizData.flashcards && !quizData.questions)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-8 text-slate-400">
          <BookOpen className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black mb-4">{language === 'ar' ? 'ما في بطاقات لسه! 🗂️' : 'No flashcards yet! 🗂️'}</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">{language === 'ar' ? 'ارفع ملف واعمل كويز عشان نولّدلك بطاقات مراجعة أسطورية.' : 'Upload a file and create a quiz to generate legendary review cards.'}</p>
        <Link href="/upload">
          <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl">
            {t('common.upload')}
          </Button>
        </Link>
      </div>
    )
  }

  // Normalize flashcards data: keys from API are front/back, component expects question/answer
  const cards = quizData.flashcards 
    ? quizData.flashcards.map((f: any) => ({
        question: f.front || f.question,
        answer: f.back || f.answer,
        explanation: f.explanation || ''
      }))
    : quizData.questions.map((q: any) => ({
        question: q.question,
        answer: q.answer,
        explanation: q.explanation
      }))

  return (
    <main className="min-h-screen pt-44 pb-20 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 h-[calc(100vh-12rem)] flex flex-col">
        <div className="flex items-center justify-between mb-8">
             <Link href="/">
                <Button variant="ghost" className="gap-2 font-bold">
                    <ArrowLeft className={`w-5 h-5 ${language === 'en' ? '' : 'rotate-180'}`} />
                    {t('common.homeBtn')}
                </Button>
             </Link>
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
