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
  Zap,
  Target,
  CheckCircle2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Twitter,
  Copy,
  Loader2,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { Flashcards } from '@/components/flashcards'
import { AdPlaceholder } from '@/components/ads/AdPlaceholder'
import { GamificationEngine } from '@/lib/gamification'
import { triggerConfetti, triggerSuccessConfetti } from '@/lib/effects'
import { useToast } from '@/components/ui/toast-provider'
import { useAuth } from '@/hooks/useAuth'
import { AccessControl } from '@/lib/services/accessControl'

export default function ResultsPage() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<any>(null)
  const [topics, setTopics] = useState<any[]>([])
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [newLevel, setNewLevel] = useState(1)
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([])
  const [explainingId, setExplainingId] = useState<number | null>(null)
  const [explanations, setExplanations] = useState<Record<number, string>>({})
  const router = useRouter()

  const handleExplain = async (q: any, answer: any, idx: number) => {
    if (explanations[idx]) return; // Already explained
    
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
          // Collect the page number if it exists and is not null/undefined
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
 
      // Track mistakes per topic for "Mistake Location" Explorer
      const mistakes = results.questions
        .filter((q: any, idx: number) => !results.answers[idx]?.isCorrect)
        .map((q: any) => q.topic || 'عام')
      results.mistakes = mistakes; // Informative for later if needed

      // Calculate and award XP - ONLY IF NOT ALREADY AWARDED
      const resultId = `xp_awarded_${results.timestamp}`;
      if (!localStorage.getItem(resultId)) {
          const xp = GamificationEngine.calculateQuizXP(results.score, results.total, 120); // Dummy time for now
          const updatedData = GamificationEngine.addXP(xp);
          setEarnedXP(xp);
          setNewLevel(updatedData.level);
          setUnlockedBadges(updatedData.badges.filter((b: any) => (Date.now() - b.unlockedAt) < 10000)); // Show recently unlocked
          
          localStorage.setItem(resultId, "true");
      } else {
        // If already awarded, just show 0 or current user XP state without re-adding
        // We can optionally fetch current state to show updated level
        const currentData = GamificationEngine.getData();
        setEarnedXP(0);
        setNewLevel(currentData.level);
      }

      // Check for badges
      if (results.score > 0) {
        GamificationEngine.unlockBadge('first_win');
        triggerSuccessConfetti();
      }

      // Celebrate high scores
      if ((results.score / results.total) >= 0.9) {
          setTimeout(() => triggerConfetti(), 1000);
      }

      // Guest Access Control: Increment usage only if not logged in and auth resolved
      if (!authLoading && !user) {
        AccessControl.consumeGuestUsage();
      }
    }
  }, [user, authLoading]) // Add authLoading to dependencies

  // Prepare flashcards data: prioritize generated ones or fallback to questions
  const flashcardsData = React.useMemo(() => {
    if (!data) return []
    
    // 1. Try dedicated flashcards field
    if (data.flashcards && Array.isArray(data.flashcards) && data.flashcards.length > 0) {
      return data.flashcards.map((f: any) => ({
        question: f.front || f.question || "---",
        answer: f.back || f.answer || "---",
        explanation: f.explanation || ''
      }))
    }
    
    // 2. Fallback to questions
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions.map((q: any) => ({
        question: q.question || "---",
        answer: q.answer || "---",
        explanation: q.explanation || ''
      }))
    }
    
    return []
  }, [data])

  const shareOnWhatsApp = () => {
    const text = language === 'ar' 
        ? `جبت ${data.score}/${data.total} في كويز ${data.title} على Mindar! 🚀\nتقدر تتفوق علي؟ جرب حظك هون: https://mindar.tech`
        : `I scored ${data.score}/${data.total} on "${data.title}" quiz using Mindar! 🚀\nCan you beat me? Try it here: https://mindar.tech`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = language === 'ar'
        ? `جبت ${data.score}/${data.total} في كويز ${data.title} على Mindar! 🚀 #Mindar #AI #Study`
        : `I scored ${data.score}/${data.total} on "${data.title}" quiz using Mindar! 🚀 #Mindar #AI #Study`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://mindar.tech')}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('https://mindar.tech');
    toast({
        type: 'success',
        message: t('common.linkCopied'),
        description: language === 'ar' ? 'يمكنك الآن مشاركة الرابط مع أصدقائك!' : 'You can now share the link with your friends!'
    });
  };

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
      title: t('results.revengeRound', { title: data.title }),
      questions: wrongQuestions,
      vocabulary: data.vocabulary || []
    }

    localStorage.setItem("currentQuiz", JSON.stringify(revengeQuiz))
    router.push('/quiz')
  }

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
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link href="/hub">
                <Button 
                  variant="outline" 
                   className="h-14 px-8 rounded-2xl border-2 border-primary bg-background/80 text-primary hover:bg-primary hover:text-primary-foreground backdrop-blur-md shadow-lg transition-all gap-2 font-black group"
                >
                  <RotateCcw className={`w-5 h-5 transition-transform group-hover:rotate-180 ${language === 'en' ? 'rotate-180' : ''}`} />
                  {t('hub.change')}
                </Button>
              </Link>
              <Button 
                onClick={() => document.getElementById('quiz-review')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-black transition-all hover:scale-105 shadow-lg"
              >
                <FileText className="w-5 h-5" />
                {language === 'ar' ? 'مراجعة الإجابات' : 'Review Answers'}
              </Button>
              {topics.some(t => t.score < t.total) && (
                <Button 
                  onClick={() => document.getElementById('mistake-explorer')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-14 px-8 rounded-2xl bg-red-500 text-white hover:bg-red-600 gap-2 font-black transition-all hover:scale-105 shadow-lg relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                   <Target className="w-5 h-5" />
                  {t('results.smartDetails')}
                </Button>
              )}
            </div>

            {/* Social Sharing Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-4 pt-10"
            >
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                    {t('common.share')}
                </p>
                <div className="flex gap-4">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={shareOnWhatsApp}
                        className="w-14 h-14 rounded-2xl border-2 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg"
                        title={t('common.shareWhatsApp')}
                    >
                        <MessageCircle className="w-6 h-6 fill-current" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={shareOnTwitter}
                        className="w-14 h-14 rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                        title={t('common.shareTwitter')}
                    >
                        <Twitter className="w-6 h-6 fill-current" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={copyToClipboard}
                        className="w-14 h-14 rounded-2xl border-2 border-border text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-all shadow-lg"
                        title={t('common.copyLink')}
                    >
                        <Copy className="w-6 h-6" />
                    </Button>
                </div>
            </motion.div>
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
                 <span className="text-xs font-black uppercase text-primary tracking-widest">{t('results.newBadges')}</span>
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

        {/* Ad Banner on Results Page */}
        <div className="my-8">
            <AdPlaceholder variant="banner" label={language === 'ar' ? 'ببرعاية Mindar AI' : 'Powered by Mindar AI Ads'} />
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
 
        {/* Mistake Location Explorer (New) */}
        {topics.some(t => t.score < t.total) && (
            <motion.div 
                id="mistake-explorer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/5 border-2 border-red-500/20 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black">{t('results.foundMistakesTitle')}</h3>
                        <p className="text-muted-foreground font-bold">{t('results.foundMistakesDesc')}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Quiz Review Section (New) */}
        <motion.div 
            id="quiz-review"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="space-y-8 pt-20"
        >
            <div className="flex items-center gap-4">
                <History className="w-10 h-10 text-primary" />
                <h2 className="text-4xl font-black">{t('results.questionReview')}</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {data.questions.map((q: any, idx: number) => {
                    const answer = data.answers[idx]
                    const isCorrect = answer?.isCorrect
                    
                    return (
                        <div 
                            key={idx}
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
        </motion.div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10">
          <Link href="/hub">
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
