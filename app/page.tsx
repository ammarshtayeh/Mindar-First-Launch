"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Brain,
  Sparkles,
  Upload,
  Play,
  Zap,
  ShieldCheck,
  Globe,
  PenTool,
  Info,
  Smartphone,
  Share,
  PlusSquare,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { MotivationalBanner } from "@/components/motivational-banner";
import { AdPlaceholder } from "@/components/ads/AdPlaceholder";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t, language } = useI18n();
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [showGeneralHint, setShowGeneralHint] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [browserType, setBrowserType] = useState<
    "safari" | "chrome" | "in-app" | "other"
  >("other");

  useEffect(() => {
    setMounted(true);
    // Platform detection
    const ua = navigator.userAgent;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Browser Detection
    const inApp = /Instagram|FBAN|FBAV|LinkedIn/i.test(ua);
    const isChrome = /CriOS|Chrome/.test(ua);
    const isSafari = /Safari/.test(ua) && !isChrome && !inApp;

    if (inApp) setBrowserType("in-app");
    else if (isChrome) setBrowserType("chrome");
    else if (isSafari) setBrowserType("safari");
    else setBrowserType("other");

    const isAppStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;
    setIsStandalone(isAppStandalone);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("beforeinstallprompt fired");
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 20 },
    },
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-32 relative overflow-hidden">
      {/* Radical Static Background for Speed */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
      </div>

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

        <motion.div
          variants={item}
          className="flex items-center justify-center gap-3 px-8 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-black backdrop-blur-2xl shadow-2xl"
        >
          <Zap className="w-5 h-5 fill-primary" />
          <span>{t("home.badge")}</span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.95] py-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground via-primary to-primary/40 font-[family-name:var(--font-orbitron)]"
        >
          {t("home.title")}
        </motion.h1>

        <motion.p
          variants={item}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed font-bold"
        >
          {t("home.subtitle")}
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-6 mt-4"
        >
          <Link href="/hub">
            <Button
              size="lg"
              className="h-20 px-12 text-2xl font-black rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl"
            >
              {t("common.getStarted")} <Upload className="ml-3 w-6 h-6" />
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
                    explanation:
                      "The skin is the largest organ of the body, with a total area of about 20 square feet.",
                    topic: "Anatomy",
                  },
                  {
                    question: "How many bones are in the adult human body?",
                    options: ["206", "305", "150", "210"],
                    answer: "206",
                    explanation:
                      "Adults have 206 bones, while infants are born with around 300.",
                    topic: "Skeletal System",
                  },
                ],
                flashcards: [
                  {
                    front: "Mitochondria",
                    back: "The powerhouse of the cell.",
                  },
                  {
                    front: "DNA",
                    back: "Deoxyribonucleic acid, the hereditary material in humans.",
                  },
                ],
                vocabulary: [
                  {
                    word: "Homeostasis",
                    definition:
                      "A state of steady internal, physical, and chemical conditions maintained by living systems.",
                  },
                ],
                timestamp: Date.now(),
              };
              localStorage.setItem("currentQuiz", JSON.stringify(sampleQuiz));
              window.location.href = "/hub";
            }}
          >
            <Play className="mr-3 w-6 h-6 fill-current" />{" "}
            {t("common.seeSample")}
          </Button>
        </motion.div>

        {/* Ad Banner on Home Page - Moved Higher */}
        <motion.div variants={item} className="w-full mt-8 max-w-4xl">
          <AdPlaceholder
            variant="banner"
            label={language === "ar" ? "محتوى برعاية" : "Sponsored Content"}
          />
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-col items-center gap-4"
        >
          <Link href="/about">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary transition-colors gap-2"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t("home.discoverStory")}
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
                  {t("common.installApp")}
                </Button>
              ) : (
                // Fallback logic for iOS or when prompt is not available
                <div className="relative">
                  <Button
                    onClick={
                      isIOS
                        ? () => setShowIOSHint(!showIOSHint)
                        : () => setShowGeneralHint(!showGeneralHint)
                    }
                    variant="outline"
                    className="h-12 px-8 rounded-xl border-2 border-primary/20 bg-primary/20 text-primary hover:bg-primary/30 font-black gap-2 shadow-sm"
                  >
                    <Smartphone className="w-5 h-5" />
                    {browserType === "in-app"
                      ? language === "ar"
                        ? "افتح في المتصفح"
                        : "Open in Browser"
                      : t("common.installApp")}
                  </Button>

                  <AnimatePresence>
                    {/* iOS Hint */}
                    {showIOSHint && isIOS && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-72 p-6 bg-card border border-primary/30 rounded-3xl shadow-2xl z-50 text-right backdrop-blur-xl"
                      >
                        <div className="flex flex-col gap-4 text-sm font-bold leading-relaxed">
                          <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2 mb-2">
                            <Smartphone className="w-5 h-5" />
                            <span className="text-base">
                              {t("common.pwa_ios_title")}
                            </span>
                          </div>

                          {/* Dynamic Instruction Text based on Browser */}
                          <p className="text-xs text-muted-foreground mb-2">
                            {browserType === "safari"
                              ? "Safari Browser"
                              : browserType === "chrome"
                                ? "Chrome Browser"
                                : browserType === "in-app"
                                  ? "In-App Browser"
                                  : "Browser"}
                          </p>

                          {browserType === "in-app" ? (
                            <p className="text-destructive font-bold">
                              {t("common.pwa_in_app_warning")}
                            </p>
                          ) : (
                            <>
                              <p className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                  ١
                                </span>
                                {browserType === "chrome"
                                  ? t("common.pwa_chrome_instruction")
                                  : t("common.pwa_safari_instruction")}
                                <Share className="w-4 h-4 text-primary" />
                              </p>
                              <p className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                  ٢
                                </span>
                                {t("common.pwa_ios_step2")}{" "}
                                <PlusSquare className="w-4 h-4 text-primary" />
                              </p>
                            </>
                          )}

                          <Button
                            size="sm"
                            className="mt-2 rounded-xl"
                            onClick={() => setShowIOSHint(false)}
                          >
                            {t("common.pwa_ios_got_it")}
                          </Button>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-card" />
                      </motion.div>
                    )}

                    {/* General Hint (Android/Desktop fallback) */}
                    {showGeneralHint && !isIOS && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 p-6 bg-card border border-primary/30 rounded-3xl shadow-2xl z-50 text-center backdrop-blur-xl"
                      >
                        {browserType === "in-app" ? (
                          <p className="text-destructive font-bold leading-relaxed">
                            {t("common.pwa_in_app_warning")}
                          </p>
                        ) : (
                          <p className="text-sm font-bold leading-relaxed">
                            {t("common.pwa_android_instruction")}
                          </p>
                        )}
                        <Button
                          size="sm"
                          className="mt-3 w-full rounded-xl"
                          onClick={() => setShowGeneralHint(false)}
                        >
                          {t("common.pwa_ios_got_it")}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full"
        >
          <FeatureCard
            icon={FileText}
            title={t("home.feature1Title")}
            desc={t("home.feature1Desc")}
          />
          <FeatureCard
            icon={ShieldCheck}
            title={t("home.feature2Title")}
            desc={t("home.feature2Desc")}
          />
          <FeatureCard
            icon={Globe}
            title={t("home.feature3Title")}
            desc={t("home.feature3Desc")}
          />
        </motion.div>
      </motion.div>

      {/* Floating Decoration - Simplified */}
      <div className="absolute top-[20%] left-[5%] opacity-10 pointer-events-none">
        <PenTool className="w-20 h-20 text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-[20%] right-[5%] opacity-10 pointer-events-none">
        <Sparkles className="w-16 h-16 text-primary animate-pulse" />
      </div>

      {/* Floating Sidebar Ads for Large Screens */}
      <div className="hidden xl:block absolute left-[2%] top-[30%] w-48">
        <AdPlaceholder
          variant="sidebar"
          label={language === "ar" ? "إعلان" : "Ad"}
        />
      </div>
      <div className="hidden xl:block absolute right-[2%] top-[30%] w-48">
        <AdPlaceholder
          variant="sidebar"
          label={language === "ar" ? "إعلان" : "Ad"}
        />
      </div>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <motion.div whileHover={{ y: -5, scale: 1.01 }} className="h-full">
      <Card className="h-full bg-card/40 border-border/50 hover:border-primary/40 transition-all duration-300 rounded-[3rem] overflow-hidden backdrop-blur-md shadow-2xl relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="p-12 flex flex-col items-center gap-8 text-center relative z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary shadow-inner group-hover:shadow-[0_0_20px_rgba(79,70,229,0.1)]"
          >
            <Icon className="w-12 h-12" />
          </motion.div>

          <div className="space-y-4">
            <h3 className="font-black text-3xl text-foreground tracking-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-xl text-muted-foreground leading-relaxed font-bold">
              {desc}
            </p>
          </div>

          <div className="w-12 h-1 bg-primary/20 rounded-full group-hover:w-24 group-hover:bg-primary/40 transition-all duration-500" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
