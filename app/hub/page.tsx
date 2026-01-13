"use client"
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BrainCircuit, 
  BookOpen, 
  Swords, 
  ArrowLeft, 
  FileCheck, 
  Zap,
  BarChart3,
  Sparkles,
  Loader2,
  Trash2,
  Info,
  User,
  Terminal,
  X,
  Lock,
  Workflow
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { voiceManager } from '@/lib/voice-manager'
import { UploadSection } from '@/components/upload-section'
import { AdPlaceholder } from '@/components/ads/AdPlaceholder'
import { ActivitySettingsModal } from '@/components/activity-settings-modal'
import { useDispatch, useSelector } from 'react-redux'
import { setQuiz, clearQuiz } from '@/redux/slices/quizSlice'
import { RootState } from '@/redux/store'
import { CreativeEmptyState } from '@/components/ui/empty-state'
import { onRecentActivities, logActivity, UserActivity } from '@/lib/services/dbService'
import { useAuth } from '@/hooks/useAuth'
import { trackQuizStart, trackFileUpload, trackFlashcardView, trackChallengeStart } from '@/lib/analytics'
import { AccessControl, MAX_GUEST_QUIZZES } from '@/lib/services/accessControl'
import { AuthLimitModal } from '@/components/auth/AuthLimitModal'

export default function StudyHub() {
  const { t, language } = useI18n()
  const dispatch = useDispatch()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const quizData = useSelector((state: RootState) => state.quiz.currentQuiz)
  
  const [extractedText, setExtractedText] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [settingsModal, setSettingsModal] = useState<{ open: boolean, type: 'quiz' | 'flashcards' | 'challenge' | 'coding' | 'mindmap' }>({
    open: false,
    type: 'quiz'
  })
  const [showRadar, setShowRadar] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const loadingMessages = language === 'ar' ? [
    "جاري استخراج العبقرية من أوراقك...",
    "الذكاء الاصطناعي عم بطبخلنا كويز مرتب...",
    "ثواني بس، عم بنظم الأفكار عشانك...",
    "جاري تحويل السلايدات لبطاقات أسطورية...",
    "دماغنا الإلكتروني شغال بأعلى طاقة..."
  ] : [
    "Extracting genius from your documents...",
    "AI is cooking up a great quiz...",
    "Just a second, organizing ideas for you...",
    "Converting slides into legendary cards...",
    "Our electronic brain is working at full capacity..."
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGenerating) {
        interval = setInterval(() => {
            setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length)
        }, 2500)
    }
    return () => clearInterval(interval)
  }, [isGenerating, loadingMessages.length])

  // Load persisted text on mount
  useEffect(() => {
    const savedText = localStorage.getItem("hub_source_text")
    if (savedText) setExtractedText(savedText)
  }, [])

  // Persist text when updated
  const handleTextReady = (text: string) => {
      setExtractedText(text)
      localStorage.setItem("hub_source_text", text)
  }

  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Real-time Activity Listener (only when authenticated)
  useEffect(() => {
    if (!user) {
      setActivities([]); // Clear activities when logged out
      return;
    }
    
    const unsubscribe = onRecentActivities((data) => {
      setActivities(data)
    }, 10)
    
    return () => unsubscribe()
  }, [user])

  // Auto-log initial entry in Hub (Material ready) - ONLY ONCE PER SESSION
  useEffect(() => {
    if (extractedText && user) {
        // Use sessionStorage to persist state across refreshes
        const sessionKey = `logged_study_${user.uid}`
        const alreadyLogged = sessionStorage.getItem(sessionKey)

        if (!alreadyLogged) {
            logActivity(user.uid, user.displayName || user.email?.split('@')[0] || "Student", 'action_started_study')
            sessionStorage.setItem(sessionKey, 'true')
        }
    }
  }, [extractedText, user])

  const handleStartActivity = (type: 'quiz' | 'flashcards' | 'challenge' | 'coding' | 'mindmap') => {
      // Access Control
      if (authLoading) return // Prevent starting until auth is ready

      if (!AccessControl.hasAccess(user)) {
          setShowLimitModal(true)
          return
      }

      voiceManager.stopSpeak()
      setSettingsModal({ open: true, type })
  }



  const handleClear = () => {
    dispatch(clearQuiz())
    setExtractedText("") 
    // Force UploadSection to re-mount/clear
    setResetKey(prev => prev + 1)
    
    // STRICT RESET
    localStorage.removeItem("hub_source_text") 
    localStorage.removeItem("lastQuizResults")
    localStorage.removeItem("challengeQuiz")
    if (user) sessionStorage.removeItem(`logged_study_${user.uid}`)
  }

  const generateWithSettings = async (settings: { numQuestions: number, difficulty: string, types: string[] }) => {
      setSettingsModal({ ...settingsModal, open: false })
      setIsGenerating(true)
      
      try {
          const res = await fetch("/api/generate", {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: extractedText, // STRICT: Only use currently extracted text, never fall back to old quizData
                    ...settings,
                    types: settingsModal.type === 'coding' ? ['coding'] : (settingsModal.type === 'mindmap' ? ['mindmap'] : settings.types), 
                    type: settingsModal.type, // Explicitly pass main type
                    // Fix: For coding/mindmap questions, ALWAYS use source language to prevent bad translations
                    language: ['coding', 'mindmap'].includes(settingsModal.type) || settings.types?.includes('coding') ? 'Same as Source' : (language === 'ar' ? 'Arabic' : 'English')
                })
            })

            const data = await res.json()

            if (!res.ok) {
                if (res.status === 402) {
                     setShowLimitModal(true)
                     return
                }
                throw new Error(data.error || "Generation failed")
            }

            // Save to Redux / LocalStorage based on type
            if (settingsModal.type === 'mindmap') {
                localStorage.setItem('currentMindMap', JSON.stringify(data))
                router.push('/mindmap')
            } else {
                dispatch(setQuiz(data))
                localStorage.setItem("currentQuiz", JSON.stringify(data))
                
                if (settingsModal.type === 'flashcards') router.push('/flashcards')
                else if (settingsModal.type === 'coding') router.push("/quiz?mode=coding")
                else if (settingsModal.type === 'quiz') router.push('/quiz')
            }
          
          if (settingsModal.type === 'challenge') {
             const filtered = data.questions.filter((q: any) => 
                q.type === 'multiple-choice' || q.type === 'true-false'
             )
             localStorage.setItem("challengeQuiz", JSON.stringify({ ...data, questions: filtered }))
             trackChallengeStart()
             router.push("/challenge")
          }
          
          if (settingsModal.type === 'quiz') trackQuizStart(data.title || "New Quiz")
          if (settingsModal.type === 'flashcards') trackFlashcardView()
          if (settingsModal.type === 'coding') trackQuizStart("Coding Challenge") // Use existing track function or new one
      } catch (err) {
          console.error(err)
      } finally {
          setIsGenerating(false)
      }
  }

  const hubItems = [
    {
      key: "common.quiz",
      descKey: "hub.start",
      icon: BrainCircuit,
      color: "from-primary to-primary/60",
      type: "quiz" as const,
      badgeKey: "CHALLENGE"
    },
    {
      key: "common.flashcards",
      descKey: "common.flashcardsDesc",
      icon: BookOpen,
      color: "from-teal-500 to-teal-700",
      type: "flashcards" as const,
      badgeKey: "REVIEW"
    },
    {
      key: "common.challenge",
      descKey: "hub.compete",
      icon: Swords,
      color: "from-red-500 to-orange-600",
      type: "challenge" as const,
      badgeKey: "ONLINE"
    },
    {
      key: "common.coding",
      descKey: "hub.codingDesc", 
      icon: Terminal,
      color: "from-slate-800 to-black",
      type: "coding" as const,
      badgeKey: "BETA"
    },
    {
      key: "common.mindmap",
      descKey: "hub.mindmapDesc",
      icon: Workflow,
      color: "from-violet-600 to-fuchsia-600",
      type: "mindmap" as const,
      badgeKey: "NEW"
    }
  ]

  return (
    <main className="min-h-screen pt-44 pb-20 px-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-wrap items-center gap-3 mb-4"
                >
                    <div className="flex items-center gap-3 text-primary font-black bg-primary/10 px-4 py-1.5 rounded-full">
                        <FileCheck className="w-5 h-5" />
                        <span>{t('hub.success')}</span>
                    </div>

                    {!authLoading && !user && (
                        <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-4 py-1.5 rounded-full font-black text-sm border border-yellow-500/20">
                            <Lock className="w-4 h-4" />
                            <span>{Math.max(0, MAX_GUEST_QUIZZES - AccessControl.getGuestUsage())}/{MAX_GUEST_QUIZZES} {language === 'ar' ? 'اختبار متبقي' : 'Quizzes remaining'}</span>
                        </div>
                    )}
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
                <p className="text-xl text-muted-foreground mt-4 font-bold max-w-2xl" suppressHydrationWarning>
                    {extractedText ? (language === 'ar' ? 'تم تجهيز المادة! الآن اختر كيف تريد أن تدرس.' : 'Material ready! Now choose how you want to study.') : (quizData ? t('hub.subtitle', { title: quizData.title }) : (language === 'ar' ? 'ارفع مادتك الدراسية لنبدأ العمل!' : 'Upload your study material to start!'))}
                </p>
            </div>
            
            {isMounted && quizData && (
                <Button 
                    variant="outline" 
                    onClick={handleClear}
                    className="h-14 px-8 rounded-2xl border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all gap-2 font-black"
                >
                    <Trash2 className="w-5 h-5" />
                    <span>{language === 'ar' ? 'تغيير المادة' : 'Change Material'}</span>
                </Button>
            )}
        </div>

        {/* Upload Section Integrated */}
        <UploadSection 
            key={resetKey}
            onTextReady={handleTextReady} 
            onClear={handleClear}
            isProcessing={isGenerating} 
        />

        {/* Ad Banner on Hub Page */}
        <div className="my-10">
            <AdPlaceholder variant="banner" label={language === 'ar' ? 'مساحة إعلانية لـ AI' : 'AI Sponsored Slot'} />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500 ${!extractedText && !quizData ? 'opacity-30 grayscale pointer-events-none' : ''}`} suppressHydrationWarning>
            {hubItems.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Card 
                        onClick={() => handleStartActivity(item.type)}
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
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 fill-primary" /> {t('hub.start')}</>}
                                </span>
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <ArrowLeft className={`w-5 h-5 ${language === 'en' ? '-rotate-180' : ''}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>

        {/* Stats Preview Card */}
        {isMounted && quizData && (
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
        )}
      </div>
 
      {/* Peer Radar & Global Leaderboard */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-8">
                <div 
                    className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowRadar(true)}
                >
                    <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 fill-green-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black flex items-center gap-2">
                             {t('radar.title')} 
                             <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                                {language === 'ar' ? 'عرض الكل' : 'View All'}
                             </span>
                        </h3>
                        <p className="text-sm font-bold opacity-60">{t('radar.online', { count: activities.length })}</p>
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
 
            <div className="space-y-4 h-[220px] overflow-hidden relative" onClick={() => setShowRadar(true)}>
                {!user ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-60">
                        <User className="w-16 h-16 mb-3" />
                        <p className="font-bold text-lg">{language === 'ar' ? 'عليك تسجيل الدخول' : 'Please log in'}</p>
                        <p className="text-sm opacity-70 mt-1">{language === 'ar' ? 'لمشاهدة نشاط الزملاء' : 'to see peer activity'}</p>
                    </div>
                ) : (
                    <AnimatePresence mode='popLayout'>
                        {activities.slice(0, 4).map((act, i) => {
                            const timeAgo = act.timestamp 
                                ? (Math.floor((Date.now() - act.timestamp.toMillis()) / 60000))
                                : 0;
                            
                            const timeStr = language === 'ar' 
                                ? (timeAgo === 0 ? 'الآن' : `منذ ${timeAgo} د`)
                                : (timeAgo === 0 ? 'Just now' : `${timeAgo}m ago`);

                            return (
                                <motion.div 
                                    key={act.timestamp?.toMillis() || i}
                                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    layout
                                    className="flex items-center justify-between p-4 bg-background/30 rounded-2xl border border-border/50 group hover:border-primary/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                                            {act.userName?.[0] || 'S'}
                                        </div>
                                        <p className="font-bold text-sm truncate max-w-[220px] text-black dark:text-slate-200">
                                            {t(`radar.${act.actionKey}`, { name: act.userName })}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-black opacity-40 italic shrink-0 text-slate-500">{timeStr}</span>
                                </motion.div>
                            );
                        })}
                        {activities.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <CreativeEmptyState 
                                    icon={User}
                                    title={t('radar.beFirst')}
                                    description={language === 'ar' ? 'كن أول من ينجز نشاطاً اليوم ويظهر هنا!' : 'Be the first to complete an activity today and show up here!'}
                                />
                            </div>
                        )}
                    </AnimatePresence>
                )}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
            </div>
        </motion.div>

      {/* Radar Modal */}
      <AnimatePresence>
        {showRadar && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                onClick={() => setShowRadar(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-card w-full max-w-2xl max-h-[80vh] rounded-[3rem] border border-border shadow-3xl overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-8 border-b border-border/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6 fill-green-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black">{t('radar.title')}</h3>
                                <p className="text-sm font-bold opacity-60 text-muted-foreground">{t('radar.online', { count: activities.length })}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowRadar(false)} className="p-3 hover:bg-red-500/10 text-red-500 rounded-2xl transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                         {activities.map((act, i) => {
                            const timeAgo = act.timestamp 
                                ? (Math.floor((Date.now() - act.timestamp.toMillis()) / 60000))
                                : 0;
                            
                            const timeStr = language === 'ar' 
                                ? (timeAgo === 0 ? 'الآن' : `منذ ${timeAgo} د`)
                                : (timeAgo === 0 ? 'Just now' : `${timeAgo}m ago`);

                            return (
                                <motion.div 
                                    key={act.timestamp?.toMillis() || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-5 bg-secondary/30 rounded-3xl border border-transparent hover:border-primary/20 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black text-lg shrink-0">
                                            {act.userName?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base text-foreground">
                                                {act.userName || 'Student'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {t(`radar.${act.actionKey}`, { name: '' }).replace('', '').trim()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold bg-background px-3 py-1 rounded-full border border-border/50 shadow-sm">{timeStr}</span>
                                </motion.div>
                            );
                        })}
                        {activities.length === 0 && (
                            <div className="py-20 text-center opacity-50">
                                <p>{language === 'ar' ? 'لا يوجد نشاط حديث' : 'No recent activity'}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
 
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary/5 backdrop-blur-3xl border-2 border-primary/20 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center justify-center text-center relative"
        >
            <div className="absolute top-4 right-6 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">LIVE</div>
            <div className="w-24 h-24 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 transform rotate-12">
                <BarChart3 className="w-12 h-12" />
            </div>
            {!user ? (
                <>
                    <h3 className="text-xl font-black mb-2">{language === 'ar' ? 'الأوائل' : 'Top Performers'}</h3>
                    <p className="text-sm font-bold opacity-60 mb-6">{language === 'ar' ? 'عليك تسجيل الدخول' : 'Please log in'}</p>
                    <Button className="w-full h-14 rounded-2xl font-black" onClick={() => router.push('/')}>
                        <span>{language === 'ar' ? 'تسجيل الدخول' : 'Log In'}</span>
                    </Button>
                </>
            ) : (
                <>
                    <h3 className="text-xl font-black mb-2">{t('results.legendary')}</h3>
                    <p className="text-sm font-bold opacity-60 mb-6">{t('radar.beFirst')}</p>
                    <Button className="w-full h-14 rounded-2xl font-black group overflow-hidden relative">
                        <span className="relative z-10">{t('common.challenge')}</span>
                        <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                    </Button>
                </>
            )}
        </motion.div>
      </div>

      <ActivitySettingsModal 
        isOpen={settingsModal.open}
        type={settingsModal.type}
        onClose={() => setSettingsModal({ ...settingsModal, open: false })}
        onStart={generateWithSettings}
      />

      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl"
          >
            <div className="relative">
                <div className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                </div>
            </div>
            <motion.div 
                key={loadingMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-10 text-center px-6"
            >
                <h3 className="text-3xl font-black mb-2 text-primary">
                    {language === 'ar' ? 'جاري التحضير...' : 'Preparing...'}
                </h3>
                <p className="text-xl font-bold opacity-60 max-w-md mx-auto">
                    {loadingMessages[loadingMessageIndex]}
                </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthLimitModal 
          isOpen={showLimitModal} 
          onClose={() => setShowLimitModal(false)} 
      />
    </main>
  )
}

