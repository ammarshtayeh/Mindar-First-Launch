"use client"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Brain, Sparkles, Upload, Play, Zap, ShieldCheck, Globe, PenTool, Info } from "lucide-react"
import { MotivationalBanner } from "@/components/motivational-banner"
import { useI18n } from "@/lib/i18n"

export default function Home() {
  const { t, language } = useI18n()
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

        
        {/* Animated Background Elements - theme aware */}
        <div className="absolute top-10 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none calm-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

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

            <motion.div variants={item}>
                <Link href="/about">
                    <Button variant="ghost" className="text-muted-foreground hover:text-primary transition-colors gap-2">
                        <Info className="w-4 h-4" />
                        {t('home.discoverStory')}
                    </Button>
                </Link>
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
