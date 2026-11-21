"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Workflow,
  ListChecks,
  MessageCircle,
  FileText,
  Map as MapIcon,
  Microscope,
  Users,
  Orbit,
  Globe,
  Share2,
  School,
  GraduationCap,
  Clapperboard,
} from "lucide-react";
import {
  getStoredLearningMode,
  setStoredLearningMode,
  type LearningMode,
} from "@/lib/learning-mode";
import { ChatPanel } from "@/components/ChatPanel";
import { RoadmapView } from "@/components/RoadmapView";
import { MasteryHeatmap } from "@/components/MasteryHeatmap";
import { StudyAnalytics } from "@/components/StudyAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { voiceManager } from "@/lib/voice-manager";
import { UploadSection } from "@/components/upload-section";
import { AdPlaceholder } from "@/components/ads/AdPlaceholder";
import { ActivitySettingsModal } from "@/components/activity-settings-modal";
import { useDispatch, useSelector } from "react-redux";
import { setQuiz, clearQuiz } from "@/redux/slices/quizSlice";
import { toggleZenMode } from "@/redux/slices/settingsSlice";
import { RootState } from "@/redux/store";
import { CreativeEmptyState } from "@/components/ui/empty-state";
import {
  onRecentActivities,
  logActivity,
  UserActivity,
  onSystemConfig,
  SystemFeatures,
} from "@/lib/services/dbService";
import { useAuth } from "@/hooks/useAuth";
import {
  trackQuizStart,
  trackFileUpload,
  trackFlashcardView,
  trackChallengeStart,
} from "@/lib/analytics";
import { AccessControl, MAX_GUEST_QUIZZES } from "@/lib/services/accessControl";
import { AuthLimitModal } from "@/components/auth/AuthLimitModal";
import { useToast } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";

export default function StudyHub() {
  const { t, language } = useI18n();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const quizData = useSelector((state: RootState) => state.quiz.currentQuiz);
  const { zenMode } = useSelector((state: RootState) => state.settings);

  const [extractedText, setExtractedText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [settingsModal, setSettingsModal] = useState<{
    open: boolean;
    type:
      | "quiz"
      | "flashcards"
      | "challenge"
      | "coding"
      | "mindmap"
      | "checklist"
      | "rooms"
      | "galaxy"
      | "commons";
  }>({
    open: false,
    type: "quiz",
  });
  const [showRadar, setShowRadar] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [roadmap, setRoadmap] = useState<any[] | null>(null);
  const { toast } = useToast();
  const [featureFlags, setFeatureFlags] = useState<SystemFeatures | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>("exam");

  useEffect(() => {
    setLearningMode(getStoredLearningMode());
  }, []);

  useEffect(() => {
    const unsubscribe = onSystemConfig((flags: SystemFeatures) => {
      setFeatureFlags(flags);
    });
    return () => unsubscribe();
  }, []);

  const switchLearningMode = (mode: LearningMode) => {
    setStoredLearningMode(mode);
    setLearningMode(mode);
  };

  const loadingMessages =
    language === "ar"
      ? [
          "جاري استخراج المعلومات بدقة من ملفاتك...",
          "الذكاء الاصطناعي يقوم بإعداد الاختبار الآن...",
          "لحظات قليلة، يتم تنظيم الأفكار من أجلك...",
          "جاري تحويل المحتوى إلى بطاقات استذكار نموذجية...",
          "المحرك الذكي يعمل بأقصى طاقة للمعالجة...",
        ]
      : [
          "Extracting genius from your documents...",
          "AI is cooking up a great quiz...",
          "Just a second, organizing ideas for you...",
          "Converting slides into legendary cards...",
          "Our electronic brain is working at full capacity...",
        ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating, loadingMessages.length]);

  // Load persisted text on mount
  useEffect(() => {
    const savedText = localStorage.getItem("hub_source_text");
    if (savedText) setExtractedText(savedText);
  }, []);

  // Persist text when updated
  const handleTextReady = (text: string) => {
    setExtractedText(text);
    localStorage.setItem("hub_source_text", text);
  };

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real-time Activity Listener (only when authenticated)
  useEffect(() => {
    if (!user) {
      setActivities([]); // Clear activities when logged out
      return;
    }

    const unsubscribe = onRecentActivities((data) => {
      setActivities(data);
    }, 10);

    return () => unsubscribe();
  }, [user]);

  // Auto-log initial entry in Hub (Material ready) - ONLY ONCE PER SESSION
  useEffect(() => {
    if (extractedText && user) {
      // Use sessionStorage to persist state across refreshes
      const sessionKey = `logged_study_${user.uid}`;
      const alreadyLogged = sessionStorage.getItem(sessionKey);

      if (!alreadyLogged) {
        logActivity(
          user.uid,
          user.displayName || user.email?.split("@")[0] || "Student",
          "action_started_study",
        );
        sessionStorage.setItem(sessionKey, "true");
      }
    }
  }, [extractedText, user]);

  // Welcome greeting on login - ONCE PER SESSION
  useEffect(() => {
    if (user && !authLoading) {
      const welcomeKey = `welcomed_${user.uid}`;
      const hasWelcomed = sessionStorage.getItem(welcomeKey);

      if (!hasWelcomed) {
        const displayName =
          user.displayName || user.email?.split("@")[0] || "Student";
        const firstName = displayName.split(" ")[0];

        toast({
          type: "success",
          message:
            language === "ar"
              ? `أهلاً بك يا ${firstName}! 🎉`
              : `Welcome back, ${firstName}! 🎉`,
          description:
            language === "ar"
              ? "سعداء بعودتك للدراسة الذكية"
              : "Happy to have you back for smart studying",
        });

        sessionStorage.setItem(welcomeKey, "true");
      }
    }
  }, [user, authLoading, language, toast]);

  const handleStartActivity = (
    type:
      | "quiz"
      | "flashcards"
      | "challenge"
      | "coding"
      | "mindmap"
      | "checklist"
      | "summaries"
      | "ask"
      | "roadmap"
      | "rooms"
      | "interview"
      | "galaxy"
      | "commons"
      | "reel",
  ) => {
    if (type === "roadmap") {
      generateRoadmap();
      return;
    }

    if (type === "summaries") {
      router.push("/hub/summaries");
      return;
    }

    if (type === "coding") {
      router.push("/tech-lab");
      return;
    }

    if (type === "ask") {
      setIsChatOpen(true);
      return;
    }

    if (type === "rooms") {
      router.push("/rooms");
      return;
    }

    if (type === "interview") {
      router.push("/interview");
      return;
    }

    if (type === "galaxy") {
      router.push("/hub/galaxy");
      return;
    }

    if (type === "reel") {
      router.push("/hub/reel");
      return;
    }

    if (type === "commons") {
      router.push("/commons");
      return;
    }

    // Check for Coming Soon features
    const item = hubItems.find((i) => i.type === type);
    if (item?.isComingSoon) {
      toast({
        type: "warning",
        message: t("hub.featureComingSoon"),
      });
      return;
    }

    // Access Control
    if (authLoading) return; // Prevent starting until auth is ready

    if (!AccessControl.hasAccess(user)) {
      setShowLimitModal(true);
      return;
    }

    voiceManager.stopSpeak();
    setSettingsModal({ open: true, type });
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedText,
          language: language === "ar" ? "ar" : "en",
        }),
      });
      const data = await res.json();
      if (data.milestones) setRoadmap(data.milestones);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    dispatch(clearQuiz());
    setExtractedText("");
    // Force UploadSection to re-mount/clear
    setResetKey((prev) => prev + 1);

    // STRICT RESET
    localStorage.removeItem("hub_source_text");
    localStorage.removeItem("lastQuizResults");
    localStorage.removeItem("challengeQuiz");
    localStorage.removeItem("mindar_last_reel");
    if (user) sessionStorage.removeItem(`logged_study_${user.uid}`);
  };

  const generateWithSettings = async (settings: {
    numQuestions: number;
    difficulty: string;
    types: string[];
  }) => {
    setSettingsModal({ ...settingsModal, open: false });
    setIsGenerating(true);

    try {
      if (!user) {
        toast({
          type: "error",
          message:
            language === "ar" ? "يجب تسجيل الدخول أولاً" : "Please login first",
        });
        return;
      }

      if (settingsModal.type === "checklist") {
        // Save to Firebase via checklistService
        const { createChecklist, getChecklistByMaterial } =
          await import("@/lib/services/checklistService");

        // Try to find existing first
        const existing = await getChecklistByMaterial(
          user!.uid,
          quizData?.id || extractedText.substring(0, 50),
        );
        if (existing) {
          router.push(`/checklist/${existing.materialId}`);
          return;
        }

        const res = await fetch("/api/generate-checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: extractedText,
            language: language === "ar" ? "ar" : "en",
            materialTitle: quizData?.title || "New Study Material",
          }),
        });

        const data = await res.json();

        if (!res.ok)
          throw new Error(data.error || "Checklist generation failed");

        const checklistId = await createChecklist(
          user!.uid,
          quizData?.id || crypto.randomUUID(),
          data.materialTitle,
          data.items,
        );

        toast({
          type: "success",
          message:
            language === "ar"
              ? "تم إنشاء خطتك الدراسية! 📋"
              : "Study plan created! 📋",
          description:
            language === "ar"
              ? "يمكنك الآن متابعة تقدمك في الدراسة."
              : "You can now track your study progress.",
        });

        router.push(`/checklist/${quizData?.id || checklistId}`);
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedText, // STRICT: Only use currently extracted text, never fall back to old quizData
          ...settings,
          mode:
            typeof window !== "undefined"
              ? localStorage.getItem("mindar_learning_mode") || "exam"
              : "exam",
          focusTopics:
            typeof window !== "undefined"
              ? (() => {
                  try {
                    const raw = localStorage.getItem("mindar_gap_focus_topics");
                    const parsed = raw ? JSON.parse(raw) : [];
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      localStorage.removeItem("mindar_gap_focus_topics");
                      return parsed;
                    }
                  } catch {}
                  return [];
                })()
              : [],
          types:
            settingsModal.type === "coding"
              ? ["coding"]
              : settingsModal.type === "mindmap"
                ? ["mindmap"]
                : settings.types,
          type: settingsModal.type, // Explicitly pass main type
          // Fix: For coding/mindmap questions, ALWAYS use source language to prevent bad translations
          language:
            ["coding", "mindmap"].includes(settingsModal.type) ||
            settings.types?.includes("coding")
              ? "Same as Source"
              : language === "ar"
                ? "Arabic"
                : "English",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setShowLimitModal(true);
          return;
        }
        throw new Error(data.error || "Generation failed");
      }

      // Save to Redux / LocalStorage based on type
      if (settingsModal.type === "mindmap") {
        localStorage.setItem("currentMindMap", JSON.stringify(data));
        router.push("/mindmap");
      } else {
        dispatch(setQuiz(data));
        localStorage.setItem("currentQuiz", JSON.stringify(data));

        if (settingsModal.type === "flashcards") router.push("/flashcards");
        else if (settingsModal.type === "coding")
          router.push("/quiz?mode=coding");
        else if (settingsModal.type === "quiz") router.push("/quiz");
      }

      if (settingsModal.type === "challenge") {
        const filtered = data.questions.filter(
          (q: any) => q.type === "multiple-choice" || q.type === "true-false",
        );
        localStorage.setItem(
          "challengeQuiz",
          JSON.stringify({ ...data, questions: filtered }),
        );
        trackChallengeStart();
        router.push("/challenge");
      }

      if (settingsModal.type === "quiz")
        trackQuizStart(data.title || "New Quiz");
      if (settingsModal.type === "flashcards") trackFlashcardView();
      if (settingsModal.type === "coding") trackQuizStart("Coding Challenge"); // Use existing track function or new one
    } catch (err: any) {
      console.error(err);
      toast({
        type: "error",
        message:
          language === "ar" ? "فشل التوليد" : "Generation failed",
        description:
          err?.message ||
          (language === "ar"
            ? "حاول مرة أخرى بعد لحظات"
            : "Please try again in a moment"),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !extractedText) return;

    try {
      setIsGenerating(true);
      const { updateStudyMaterial, saveStudyMaterial } =
        await import("@/lib/services/dbService");

      const materialId = quizData?.id;
      const title = quizData?.title || "Shared Material";

      const dataToSave = {
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Student",
        title: title,
        extractedText: extractedText,
        isPublic: true,
        category: "Community Shared",
        tags: ["commons"],
        folderId: null,
      };

      if (materialId) {
        await updateStudyMaterial(materialId, dataToSave);
      } else {
        await saveStudyMaterial(dataToSave);
      }

      toast({
        type: "success",
        message:
          language === "ar"
            ? "تم النشر في مستودع العقول! 🌍"
            : "Published to Mindar Commons! 🌍",
        description:
          language === "ar"
            ? "مادتك التعليمية متاحة الآن للجميع."
            : "Your material is now available to the community.",
      });

      router.push("/commons");
    } catch (err: any) {
      toast({ type: "error", message: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const hubItems = [
    {
      key: "common.quiz",
      descKey: "hub.start",
      icon: BrainCircuit,
      color: "from-primary to-primary/60",
      type: "quiz" as const,
      badgeKey: "CHALLENGE",
      isComingSoon: false,
    },
    {
      key: "common.flashcards",
      descKey: "common.flashcardsDesc",
      icon: BookOpen,
      color: "from-teal-500 to-teal-700",
      type: "flashcards" as const,
      badgeKey: "REVIEW",
      isComingSoon: false,
    },
    {
      key: "common.challenge",
      descKey: "hub.compete",
      icon: Swords,
      color: "from-red-500 to-orange-600",
      type: "challenge" as const,
      badgeKey: "ONLINE",
      isComingSoon: false,
    },
    {
      key: "common.coding",
      descKey: "hub.codingDesc",
      icon: Microscope,
      color: "from-slate-800 to-black",
      type: "coding" as const,
      badgeKey: "BETA",
      isComingSoon: false,
    },
    {
      key: "common.mindmap",
      descKey: "hub.mindmapDesc",
      icon: Workflow,
      color: "from-violet-600 to-fuchsia-600",
      type: "mindmap" as const,
      badgeKey: "NEW",
      isComingSoon: false,
    },
    {
      key: "common.studyChecklist",
      descKey: "hub.checklistDesc",
      icon: ListChecks,
      color: "from-emerald-600 to-green-500",
      type: "checklist" as const,
      badgeKey: "NEW",
      isComingSoon: false,
    },
    {
      key: "common.interview",
      descKey: "hub.interviewDesc",
      icon: MessageCircle,
      color: "from-blue-600 to-indigo-600",
      type: "interview" as const,
      badgeKey: "BETA",
      isComingSoon: false,
    },
    {
      key: "hub.mulakhasat",
      descKey: "hub.mulakhasatDesc",
      icon: BookOpen,
      color: "from-blue-600 to-indigo-700",
      type: "summaries" as const,
      badgeKey: "NEW",
      isComingSoon: false,
    },
    {
      key: "askMindar.title",
      descKey: "askMindar.desc",
      icon: MessageCircle,
      color: "from-amber-400 to-orange-500",
      type: "ask" as const,
      badgeKey: "AI",
      isComingSoon: false,
    },
    {
      key: "roadmap.title",
      descKey: "roadmap.desc",
      icon: MapIcon,
      color: "from-blue-400 to-cyan-500",
      type: "roadmap" as const,
      badgeKey: "AI",
      isComingSoon: false,
    },
    {
      key: "common.rooms",
      descKey: "common.roomsDesc",
      icon: Users,
      color: "from-blue-600 to-indigo-700",
      type: "rooms" as const,
      badgeKey: "LIVE",
      isComingSoon: false,
    },
    {
      key: "hub.galaxy",
      descKey: "hub.galaxyDesc",
      icon: Orbit,
      color: "from-indigo-900 via-purple-900 to-black",
      type: "galaxy" as const,
      badgeKey: "NEW",
      isComingSoon: false,
    },
    {
      key: "hub.reel",
      descKey: "hub.reelDesc",
      icon: Clapperboard,
      color: "from-rose-600 via-orange-500 to-amber-400",
      type: "reel" as const,
      badgeKey: "REEL",
      isComingSoon: false,
    },
    {
      key: "hub.commons",
      descKey: "hub.commonsDesc",
      icon: Globe,
      color: "from-emerald-500 to-teal-600",
      type: "commons" as const,
      badgeKey: "COMMUNITY",
      isComingSoon: false,
    },
  ];

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
              {(extractedText || quizData) && (
                <div className="flex items-center gap-3 text-primary font-black bg-primary/10 px-4 py-1.5 rounded-full">
                  <FileCheck className="w-5 h-5" />
                  <span>{t("hub.success")}</span>
                </div>
              )}

              {!authLoading && !user && (
                <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-4 py-1.5 rounded-full font-black text-sm border border-yellow-500/20">
                  <Lock className="w-4 h-4" />
                  <span>
                    {Math.max(
                      0,
                      MAX_GUEST_QUIZZES - AccessControl.getGuestUsage(),
                    )}
                    /{MAX_GUEST_QUIZZES}{" "}
                    {language === "ar" ? "اختبار متبقي" : "Quizzes remaining"}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-card/80 border border-border px-2 py-1.5 rounded-full">
                <button
                  type="button"
                  onClick={() => switchLearningMode("catchup")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all",
                    learningMode === "catchup"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <School className="w-3.5 h-3.5" />
                  {t("hub.modeCatchup")}
                </button>
                <button
                  type="button"
                  onClick={() => switchLearningMode("exam")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all",
                    learningMode === "exam"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  {t("hub.modeExam")}
                </button>
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tight"
            >
              {language === "ar" ? (
                <>
                  هل أنت مستعد{" "}
                  <span className="text-primary italic">للتحدي</span>؟ 🚀
                </>
              ) : (
                <>
                  Ready for the{" "}
                  <span className="text-primary italic">Challenge</span>? 🚀
                </>
              )}
            </motion.h1>
            <p
              className="text-lg text-muted-foreground mt-4 font-medium max-w-2xl"
              suppressHydrationWarning
            >
              {extractedText
                ? language === "ar"
                  ? "تم تجهيز المادة! الآن اختر كيف تريد أن تدرس."
                  : "Material ready! Now choose how you want to study."
                : quizData
                  ? t("hub.subtitle", { title: quizData.title })
                  : language === "ar"
                    ? "ارفع مادتك الدراسية لنبدأ العمل!"
                    : "Upload your study material to start!"}
            </p>
          </div>

          {isMounted && quizData && (
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handlePublish}
                disabled={isGenerating}
                className="h-14 px-8 rounded-2xl border-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all gap-2 font-black"
              >
                <Share2 className="w-5 h-5" />
                <span>
                  {language === "ar" ? "نشر للجميع" : "Publish to Commons"}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                className="h-14 px-8 rounded-2xl border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all gap-2 font-black"
              >
                <Trash2 className="w-5 h-5" />
                <span>
                  {language === "ar" ? "تغيير المادة" : "Change Material"}
                </span>
              </Button>
            </div>
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
          <AdPlaceholder
            variant="banner"
            label={
              language === "ar" ? "مساحة إعلانية لـ AI" : "AI Sponsored Slot"
            }
          />
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500"
          suppressHydrationWarning
        >
          {authLoading
            ? // Skeleton Loading State
              Array.from({ length: 5 }).map((_, idx) => (
                <motion.div
                  key={`skeleton-${idx}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-4 border-transparent rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-10 flex flex-col h-full">
                      <Skeleton className="w-20 h-20 rounded-[2rem] mb-8" />
                      <div className="space-y-4 mb-10 flex-1">
                        <Skeleton className="h-9 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-border/50">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            : hubItems.map((item, idx) => {
                const flagKey =
                  item.type === "ask"
                    ? "askMindar"
                    : (item.type as keyof SystemFeatures);
                const isEnabled = featureFlags
                  ? featureFlags[flagKey] !== false
                  : true;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      onClick={() =>
                        isEnabled && handleStartActivity(item.type)
                      }
                      className={cn(
                        "group cursor-pointer h-full border-4 border-transparent transition-all duration-500 rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-xl shadow-2xl relative",
                        !isEnabled
                          ? "grayscale opacity-60 cursor-not-allowed"
                          : "hover:scale-[1.02] hover:border-primary/20",
                        item.isComingSoon && "opacity-70 grayscale-[0.5]",
                        item.type !== "summaries" &&
                          item.type !== "coding" &&
                          item.type !== "rooms" &&
                          item.type !== "interview" &&
                          !extractedText &&
                          !quizData &&
                          isEnabled &&
                          "opacity-30 grayscale pointer-events-none disabled-card",
                      )}
                    >
                      {!isEnabled && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                          <div className="bg-red-500 text-white font-black px-6 py-2 rounded-full shadow-2xl rotate-[-5deg] border-2 border-white/20 whitespace-nowrap">
                            {language === "ar"
                              ? "قيد التجربة / صيانة"
                              : "Under Trial / Maintenance"}
                          </div>
                        </div>
                      )}
                      <CardContent className="p-10 flex flex-col h-full">
                        <div
                          className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-8 shadow-xl group-hover:rotate-12 transition-transform duration-500 relative`}
                        >
                          <item.icon className="w-10 h-10" />
                          {item.isComingSoon && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">
                              {t("common.comingSoon")}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-3xl font-black">
                              {t(item.key)}
                            </h3>
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-lg uppercase">
                              {item.badgeKey.includes(".")
                                ? t(item.badgeKey)
                                : item.badgeKey}
                            </span>
                          </div>
                          <p className="text-lg text-muted-foreground leading-snug font-bold">
                            {t(item.descKey)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-border/50">
                          <span className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            {item.isComingSoon ? (
                              <span className="text-muted-foreground">
                                {t("common.comingSoon")}
                              </span>
                            ) : isGenerating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Zap className="w-4 h-4 fill-primary" />{" "}
                                {t("hub.start")}
                              </>
                            )}
                          </span>
                          {!item.isComingSoon && (
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              <ArrowLeft
                                className={`w-5 h-5 ${language === "en" ? "-rotate-180" : ""}`}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
                  {t("hub.compete")}
                </h2>
                <p className="text-xl text-muted-foreground font-bold max-w-xl">
                  {t("hub.discovery", {
                    questions: quizData.questions?.length || 0,
                    flashcards: quizData.flashcards?.length || 0,
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-background/50 p-6 rounded-[2rem] border border-border/50 backdrop-blur-md">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground font-black uppercase">
                    {t("hub.rewards")}
                  </p>
                  <p className="text-3xl font-black text-primary">
                    +{quizData.questions?.length * 50} XP
                  </p>
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
          className={cn(
            "bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden",
            !user ? "lg:col-span-3" : "lg:col-span-2",
          )}
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
                  {t("radar.title")}
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                    {language === "ar" ? "عرض الكل" : "View All"}
                  </span>
                </h3>
                <p className="text-sm font-bold opacity-60">
                  {t("radar.online", { count: activities.length })}
                </p>
              </div>
            </div>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-background bg-slate-${i * 100 + 200} flex items-center justify-center font-black text-[10px]`}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>

          <div
            className="space-y-4 h-[220px] overflow-hidden relative"
            onClick={() => setShowRadar(true)}
          >
            {!user ? (
              <div className="flex flex-col items-center justify-center h-full opacity-60">
                <User className="w-16 h-16 mb-3" />
                <p className="font-bold text-lg">
                  {language === "ar" ? "عليك تسجيل الدخول" : "Please log in"}
                </p>
                <p className="text-sm opacity-70 mt-1">
                  {language === "ar"
                    ? "لمشاهدة نشاط الزملاء"
                    : "to see peer activity"}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {activities.slice(0, 4).map((act, i) => {
                  const timeAgo = act.timestamp
                    ? Math.floor(
                        (Date.now() - act.timestamp.toMillis()) / 60000,
                      )
                    : 0;

                  const timeStr =
                    language === "ar"
                      ? timeAgo === 0
                        ? "الآن"
                        : `منذ ${timeAgo} د`
                      : timeAgo === 0
                        ? "Just now"
                        : `${timeAgo}m ago`;

                  return (
                    <motion.div
                      key={act.timestamp?.toMillis() || i}
                      initial={{ opacity: 0, x: -20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.2 },
                      }}
                      layout
                      className="flex items-center justify-between p-4 bg-background/30 rounded-2xl border border-border/50 group hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                          {act.userName?.[0] || "S"}
                        </div>
                        <p className="font-bold text-sm truncate max-w-[220px] text-black dark:text-slate-200">
                          {t(`radar.${act.actionKey}`, { name: act.userName })}
                        </p>
                      </div>
                      <span className="text-[10px] font-black opacity-40 italic shrink-0 text-slate-500">
                        {timeStr}
                      </span>
                    </motion.div>
                  );
                })}
                {activities.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <CreativeEmptyState
                      icon={User}
                      title={t("radar.beFirst")}
                      description={
                        language === "ar"
                          ? "كن أول من ينجز نشاطاً اليوم ويظهر هنا!"
                          : "Be the first to complete an activity today and show up here!"
                      }
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
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 border-b border-border/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 fill-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">
                        {t("radar.title")}
                      </h3>
                      <p className="text-sm font-bold opacity-60 text-muted-foreground">
                        {t("radar.online", { count: activities.length })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRadar(false)}
                    className="p-3 hover:bg-red-500/10 text-red-500 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {activities.map((act, i) => {
                    const timeAgo = act.timestamp
                      ? Math.floor(
                          (Date.now() - act.timestamp.toMillis()) / 60000,
                        )
                      : 0;

                    const timeStr =
                      language === "ar"
                        ? timeAgo === 0
                          ? "الآن"
                          : `منذ ${timeAgo} د`
                        : timeAgo === 0
                          ? "Just now"
                          : `${timeAgo}m ago`;

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
                            {act.userName?.[0] || "S"}
                          </div>
                          <div>
                            <p className="font-bold text-base text-foreground">
                              {act.userName || "Student"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t(`radar.${act.actionKey}`, { name: "" })
                                .replace("", "")
                                .trim()}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-background px-3 py-1 rounded-full border border-border/50 shadow-sm">
                          {timeStr}
                        </span>
                      </motion.div>
                    );
                  })}
                  {activities.length === 0 && (
                    <div className="py-20 text-center opacity-50">
                      <p>
                        {language === "ar"
                          ? "لا يوجد نشاط حديث"
                          : "No recent activity"}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {user && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary/5 backdrop-blur-3xl border-2 border-primary/20 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center justify-center text-center relative"
          >
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Zap className={cn("w-8 h-8", zenMode ? "fill-primary" : "")} />
            </div>
            <h3 className="text-xl font-black mb-4">
              {language === "ar" ? "وضع الهدوء" : "Zen Mode"}
            </h3>
            <Button
              onClick={() => dispatch(toggleZenMode())}
              variant={zenMode ? "default" : "outline"}
              className="w-full h-12 rounded-xl font-black gap-2"
            >
              {zenMode
                ? language === "ar"
                  ? "إيقاف الهدوء"
                  : "Disable Zen"
                : language === "ar"
                  ? "تفعيل الهدوء"
                  : "Enable Zen"}
            </Button>
          </motion.div>
        )}
      </div>

      <div className="max-w-6xl mx-auto mt-12 space-y-12 pb-32">
        <MasteryHeatmap activities={activities} />
        <StudyAnalytics data={[]} />
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
                {t("upload.preparing")}
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

      <ChatPanel
        text={extractedText}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {roadmap && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto py-20 relative">
            <button
              onClick={() => setRoadmap(null)}
              className="absolute top-10 right-0 p-4 bg-red-500 text-white rounded-2xl font-black"
            >
              {language === "ar" ? "إغلاق الخارطة" : "Close Roadmap"}
            </button>
            <RoadmapView milestones={roadmap} />
          </div>
        </div>
      )}
    </main>
  );
}
