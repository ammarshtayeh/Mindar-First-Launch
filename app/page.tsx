"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Brain, Sparkles, Upload, Play, Zap, ShieldCheck, Globe, PenTool, Info, Smartphone, Share, PlusSquare } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { MotivationalBanner } from "@/components/motivational-banner"
import { AdPlaceholder } from "@/components/ads/AdPlaceholder"
import { useI18n } from "@/lib/i18n"

export default function Home() {
  const { t, language } = useI18n()
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIOSHint, setShowIOSHint] = useState(false)
  const [showGeneralHint, setShowGeneralHint] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
    // Platform detection
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(isAppStandalone);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt fired');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 20 } }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-32 relative overflow-hidden">

        
        {/* Optimized Background Elements */}
        <div className="absolute top-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="z-10 max-w-6xl w-full flex flex-col items-center text-center gap-10"
        >
            {/* Motivational Banner */}
            <motion.div variants={item} className="w-full px-4">
                <MotivationalBanner context="home" />
            </motion.div>

            <motion.div variants={item} className="flex items-center justify-center gap-3 px-8 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-black backdrop-blur-2xl shadow-2xl">
                <Zap className="w-5 h-5 fill-primary" />
                <span>{t('home.badge')}</span>
            </motion.div>

            <motion.h1 variants={item} 
              className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.95] py-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground via-primary to-primary/40 font-[family-name:var(--font-orbitron)]"
            >
              {t('home.title')}
            </motion.h1>

            <motion.p variants={item} className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed font-bold">
                {t('home.subtitle')}
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-6 mt-4">
                <Link href="/hub">
                    <Button size="lg" className="h-20 px-12 text-2xl font-black rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] transition-all shadow-[0_20px_50px_hsl(var(--primary)/0.25)] ring-4 ring-primary/20">
                        {t('common.getStarted')} <Upload className="ml-3 w-6 h-6" />
                    </Button>
                </Link>
                <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-20 px-12 text-2xl font-black rounded-2xl border-2 border-primary bg-background/80 text-primary hover:bg-primary hover:text-primary-foreground backdrop-blur-md shadow-lg transition-all"
                    onClick={() => {
                        const sampleQuiz = {
                            title: "Human Anatomy 101 (Sample)",
                            questions: [
                                {
                                    question: "What is the largest organ in the human body?",
                                    options: ["Heart", "Liver", "Skin", "Lungs"],
                                    answer: "Skin",
                                    explanation: "The skin is the largest organ of the body, with a total area of about 20 square feet.",
                                    topic: "Anatomy"
                                },
                                {
                                    question: "How many bones are in the adult human body?",
                                    options: ["206", "305", "150", "210"],
                                    answer: "206",
                                    explanation: "Adults have 206 bones, while infants are born with around 300.",
                                    topic: "Skeletal System"
                                }
                            ],
                            flashcards: [
                                { front: "Mitochondria", back: "The powerhouse of the cell." },
                                { front: "DNA", back: "Deoxyribonucleic acid, the hereditary material in humans." }
                            ],
                            vocabulary: [
                                { word: "Homeostasis", definition: "A state of steady internal, physical, and chemical conditions maintained by living systems." }
                            ],
                            timestamp: Date.now()
                        };
                        localStorage.setItem("currentQuiz", JSON.stringify(sampleQuiz));
                        window.location.href = "/hub";
                    }}>
                    <Play className="mr-3 w-6 h-6 fill-current" /> {t('common.seeSample')}
                </Button>
            </motion.div>

            {/* Ad Banner on Home Page - Moved Higher */}
            <motion.div variants={item} className="w-full mt-8 max-w-4xl">
                <AdPlaceholder variant="banner" label={language === 'ar' ? 'محتوى برعاية' : 'Sponsored Content'} />
            </motion.div>

            <motion.div variants={item} className="flex flex-col items-center gap-4">
                <Link href="/about">
                    <Button variant="ghost" className="text-muted-foreground hover:text-primary transition-colors gap-2">
                        <span className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            {t('home.discoverStory')}
                        </span>
                    </Button>
                </Link>

                {/* PWA Installation Section - Dynamic per Platform */}
                {mounted && !isStandalone && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex flex-col items-center"
                    >
                        {/* 1. Android/Chrome/Desktop (Programmatic) */}
                        {deferredPrompt ? (
                            <Button 
                                onClick={handleInstallClick}
                                variant="outline"
                                className="h-12 px-8 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black gap-2 animate-pulse shadow-lg"
                            >
                                <Smartphone className="w-5 h-5" />
                                {t('common.installApp')}
                            </Button>
                        ) : !isIOS ? (
                            // Fallback for non-iOS where prompt hasn't fired yet
                            <div className="relative">
                                <Button 
                                    onClick={() => setShowGeneralHint(!showGeneralHint)}
                                    variant="outline"
                                    className="h-12 px-8 rounded-xl border-2 border-primary/20 bg-primary/20 text-primary hover:bg-primary/30 font-black gap-2 shadow-sm"
                                >
                                    <Smartphone className="w-5 h-5" />
                                    {t('common.installApp')}
                                </Button>
                                <AnimatePresence>
                                    {showGeneralHint && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 p-6 bg-card border border-primary/30 rounded-3xl shadow-2xl z-50 text-center backdrop-blur-xl"
                                        >
                                            <p className="text-sm font-bold leading-relaxed">
                                                {language === 'ar' 
                                                  ? 'ثبّت التطبيق من إعدادات المتصفح (القائمة النقاط الثلاث الجانبية)' 
                                                  : 'Install from browser settings (three dots menu)'}
                                            </p>
                                            <Button 
                                                size="sm" 
                                                className="mt-3 w-full rounded-xl"
                                                onClick={() => setShowGeneralHint(false)}
                                            >
                                                {t('common.pwa_ios_got_it')}
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : null}

                        {/* 2. iOS (Instructional) */}
                        {isIOS && (
                            <div className="relative">
                                <Button 
                                    onClick={() => setShowIOSHint(!showIOSHint)}
                                    variant="outline"
                                    className="h-12 px-8 rounded-xl border-2 border-primary/20 bg-primary/20 text-primary hover:bg-primary/30 font-black gap-2 shadow-sm"
                                >
                                    <PlusSquare className="w-5 h-5" />
                                    {t('common.pwa_ios_title')}
                                </Button>

                                <AnimatePresence>
                                    {showIOSHint && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 p-6 bg-card border border-primary/30 rounded-3xl shadow-2xl z-50 text-right backdrop-blur-xl"
                                        >
                                            <div className="flex flex-col gap-4 text-sm font-bold leading-relaxed">
                                                <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2 mb-2">
                                                    <Smartphone className="w-5 h-5" />
                                                    <span className="text-base">{t('common.pwa_ios_title')}</span>
                                                </div>
                                                <p className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">١</span>
                                                    {t('common.pwa_ios_step1')} <Share className="w-4 h-4 text-primary" />
                                                </p>
                                                <p className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">٢</span>
                                                    {t('common.pwa_ios_step2')} <PlusSquare className="w-4 h-4 text-primary" />
                                                </p>
                                                <Button 
                                                    size="sm" 
                                                    className="mt-2 rounded-xl"
                                                    onClick={() => setShowIOSHint(false)}
                                                >
                                                    {t('common.pwa_ios_got_it')}
                                                </Button>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-card" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full">
                <FeatureCard 
                    icon={FileText} 
                    title={t('home.feature1Title')} 
                    desc={t('home.feature1Desc')} 
                />
                <FeatureCard 
                    icon={ShieldCheck} 
                    title={t('home.feature2Title')} 
                    desc={t('home.feature2Desc')} 
                />
                <FeatureCard 
                    icon={Globe} 
                    title={t('home.feature3Title')} 
                    desc={t('home.feature3Desc')} 
                />
            </motion.div>
        </motion.div>

        {/* Floating Decoration */}
        <div className="absolute top-[20%] left-[5%] opacity-20 pointer-events-none animate-bounce duration-[3s]">
            <PenTool className="w-20 h-20 text-primary" />
        </div>
        <div className="absolute bottom-[20%] right-[5%] opacity-20 pointer-events-none animate-bounce duration-[4s]">
            <Sparkles className="w-16 h-16 text-primary" />
        </div>

        {/* Floating Sidebar Ads for Large Screens */}
        <div className="hidden xl:block absolute left-[2%] top-[30%] w-48">
            <AdPlaceholder variant="sidebar" label={language === 'ar' ? 'إعلان' : 'Ad'} />
        </div>
        <div className="hidden xl:block absolute right-[2%] top-[30%] w-48">
            <AdPlaceholder variant="sidebar" label={language === 'ar' ? 'إعلان' : 'Ad'} />
        </div>
    </main>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <Card className="bg-card/50 border-border hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] group rounded-[2rem] overflow-hidden backdrop-blur-sm">
            <CardContent className="p-10 flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors shadow-inner">
                    <Icon className="w-10 h-10" />
                </div>
                <div>
                    <h3 className="font-black text-2xl text-foreground mb-3 tracking-tight">{title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed font-bold">{desc}</p>
                </div>
            </CardContent>
        </Card>
    )
}
