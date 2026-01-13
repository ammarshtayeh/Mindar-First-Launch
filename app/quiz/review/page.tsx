"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  FileText,
  Target,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  History
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Button } from "@/components/ui/button"
import { useToast } from '@/components/ui/toast-provider'

export default function ReviewPage() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [topics, setTopics] = useState<any[]>([])
  const [explainingId, setExplainingId] = useState<number | null>(null)
  const [explanations, setExplanations] = useState<Record<number, string>>({})

  useEffect(() => {
    const stored = localStorage.getItem("lastQuizResults")
    if (stored) {
      const results = JSON.parse(stored)
      setData(results)
      
      const topicMap: Record<string, { total: number; correct: number; missedPages: Set<number> }> = {}
      results.questions.forEach((q: any, idx: number) => {
        const topic = q.topic || 'عام'
        if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0, missedPages: new Set() }
        topicMap[topic].total++
        
        const isCorrect = results.answers[idx]?.isCorrect
        if (isCorrect) {
          topicMap[topic].correct++
        } else {
          if (q.pageNumber !== undefined && q.pageNumber !== null && q.pageNumber !== 0) {
            topicMap[topic].missedPages.add(q.pageNumber)
          }
        }
      })

      const topicPerf = Object.entries(topicMap).map(([topic, stats]) => ({
        topic,
        score: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100),
        missedPages: Array.from(stats.missedPages).sort((a, b) => a - b)
      }))
      setTopics(topicPerf)
    } else {
        router.push('/hub')
    }
  }, [router])

  const handleExplain = async (q: any, answer: any, idx: number) => {
    if (explanations[idx]) return; 
    
    setExplainingId(idx);
    try {
        const res = await fetch('/api/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: q.question,
                userAnswer: answer?.selectedOption || answer?.textAnswer,
                correctAnswer: q.answer,
                context: q.topic,
                language: language === 'ar' ? 'ar' : 'en'
            })
        });
        const data = await res.json();
        if (data.explanation) {
            setExplanations(prev => ({ ...prev, [idx]: data.explanation }));
        }
    } catch (error) {
        console.error("Failed to explain", error);
        toast({ type: 'error', message: 'AI is busy!', description: 'Could not fetch explanation.' });
    } finally {
        setExplainingId(null);
    }
  }

  if (!data) return null

  return (
    <main className="min-h-screen pt-32 px-6 bg-background font-cairo overflow-x-hidden pb-32">
        <div className="max-w-4xl mx-auto space-y-12">
            
            <div className="flex items-center gap-4 mb-8">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="rounded-full w-12 h-12 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className={`w-6 h-6 ${language === 'en' ? 'rotate-180' : ''}`} />
                </Button>
                <div>
                    <h1 className="text-3xl font-black">{language === 'ar' ? 'مراجعة الإجابات' : 'Review Answers'}</h1>
                    <p className="text-muted-foreground font-bold">{data.title}</p>
                </div>
            </div>

            {/* Mistake Location Explorer */}
            {topics.some(t => t.score < t.total) && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/5 border-2 border-red-500/20 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black">{t('results.foundMistakesTitle')}</h3>
                            <p className="text-muted-foreground font-bold">{t('results.foundMistakesDesc')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topics.filter(t => t.score < t.total).map((topic, idx) => (
                            <div key={idx} className="bg-background/50 p-6 rounded-2xl border border-border/50 flex flex-col justify-between group transition-all hover:border-red-500/30">
                                <div>
                                    <h4 className="font-black text-xl mb-2">{topic.topic}</h4>
                                    {topic.missedPages && topic.missedPages.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground w-full mb-1">
                                                {t('results.mistakePages')}
                                            </span>
                                            {topic.missedPages.map((page: number) => (
                                                <span key={page} className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md text-[10px] font-black">
                                                    {language === 'ar' ? `ص ${page}` : `P. ${page}`}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                                     <span className="text-sm font-bold text-red-500">
                                        {t('results.errorCount', { count: topic.total - topic.score })}
                                    </span>
                                    <div className="text-[10px] font-black uppercase bg-red-500/10 px-2 py-0.5 rounded text-red-500">
                                        {t('results.accuracy', { percentage: topic.percentage })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
                {data.questions.map((q: any, idx: number) => {
                    const answer = data.answers[idx]
                    const isCorrect = answer?.isCorrect
                    
                    return (
                        <div 
                            key={idx}
                            id={`question-${idx}`}
                            className={`p-6 md:p-8 rounded-[2.5rem] border-2 transition-all bg-card/40 backdrop-blur-xl ${isCorrect ? 'border-green-500/20' : 'border-red-500/20'}`}
                        >
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {idx + 1}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-black leading-tight break-words" dir="auto">{q.question}</h3>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {q.pageNumber && q.pageNumber > 0 && (
                                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5">
                                            <FileText className="w-3 h-3 text-primary" />
                                            <span className="text-[10px] font-black text-primary">
                                                {language === 'ar' ? `ص ${q.pageNumber}` : `P.${q.pageNumber}`}
                                            </span>
                                        </div>
                                    )}
                                    {isCorrect ? <CheckCircle className="text-green-500 w-8 h-8 shrink-0" /> : (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExplain(q, answer, idx)}
                                                className="h-8 rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-black gap-1 hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <Sparkles className="w-3 h-3" />
                                                {language === 'ar' ? 'ليه غلط؟' : 'Why?'}
                                            </Button>
                                            <XCircle className="text-red-500 w-8 h-8 shrink-0" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-2xl bg-background/50 border border-border/50">
                                    <p className="text-[10px] font-black uppercase opacity-60 mb-1">{t('results.yourAnswer')}</p>
                                    <p className={`font-bold break-words ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {answer?.selectedOption || answer?.textAnswer || t('results.notAnswered')}
                                    </p>
                                </div>
                                    {!isCorrect && (
                                    <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
                                        <p className="text-[10px] font-black uppercase text-green-600/60 mb-1">{t('results.correctAnswer')}</p>
                                        <p className="font-bold text-green-600 break-words">{q.answer}</p>
                                    </div>
                                )}
                            </div>

                            {q.explanation && (
                                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                                    <p className="text-xs font-black uppercase text-primary/60 mb-2">{t('results.explanation')}</p>
                                    <p className="text-sm font-medium opacity-80 italic break-words" dir="auto">{q.explanation}</p>
                                </div>
                            )}

                            <AnimatePresence>
                                {explanations[idx] && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                                            <Sparkles className="w-4 h-4" />
                                            <p className="text-xs font-black uppercase tracking-widest">AI Tutor</p>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed text-indigo-900 dark:text-indigo-100" dir="auto">
                                            {explanations[idx]}
                                        </p>
                                    </motion.div>
                                )}
                                {explainingId === idx && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-4 flex items-center gap-2 text-muted-foreground text-sm"
                                    >
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{language === 'ar' ? 'الذكاء الاصطناعي يفكر...' : 'AI is thinking...'}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    </main>
  )
}
