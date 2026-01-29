"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Cpu,
  Binary,
  Code2,
  Layout,
  Database,
  ArrowRight,
  Sparkles,
  CircuitBoard,
  Terminal,
  ArrowLeft,
  Microscope,
  Trash2,
  FileCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UploadSection } from "@/components/upload-section";

const labModules = [
  {
    id: "logic",
    key: "techLab.logic.title",
    descKey: "techLab.logic.desc",
    icon: Binary,
    color: "from-blue-500 to-cyan-400",
    pattern: CircuitBoard,
    badge: "BETA",
  },
  {
    id: "arch",
    key: "techLab.arch.title",
    descKey: "techLab.arch.desc",
    icon: Cpu,
    color: "from-purple-600 to-indigo-500",
    pattern: Cpu,
    badge: "NEW",
  },
  {
    id: "networking",
    key: "techLab.network.title",
    descKey: "techLab.network.desc",
    icon: Network,
    color: "from-emerald-500 to-teal-400",
    pattern: Network,
    badge: "AI",
  },
  {
    id: "ds",
    key: "techLab.ds.title",
    descKey: "techLab.ds.desc",
    icon: Database,
    color: "from-orange-500 to-amber-400",
    pattern: Binary,
    badge: "VISUAL",
  },
  {
    id: "web",
    key: "techLab.web.title",
    descKey: "techLab.web.desc",
    icon: Layout,
    color: "from-pink-500 to-rose-400",
    pattern: Layout,
    badge: "SANDBOX",
  },
  {
    id: "code",
    key: "techLab.code.title",
    descKey: "techLab.code.desc",
    icon: Code2,
    color: "from-slate-800 to-slate-900",
    pattern: Terminal,
    badge: "EXPERT",
  },
];

export default function TechLabPage() {
  const { t, language } = useI18n();
  const router = useRouter();
  const [extractedText, setExtractedText] = useState<string>("");
  const [materialTitle, setMaterialTitle] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);
  const [pendingModule, setPendingModule] = useState<string | null>(null);

  // Load lab material on mount
  useEffect(() => {
    const savedText = localStorage.getItem("tech_lab_source_text");
    const savedTitle = localStorage.getItem("tech_lab_material_title");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (savedText) setExtractedText(savedText);
    if (savedTitle) setMaterialTitle(savedTitle);
  }, []);

  const handleTextReady = (text: string, title?: string) => {
    setExtractedText(text);
    setMaterialTitle(title || "Lab Material");
    localStorage.setItem("tech_lab_source_text", text);
    localStorage.setItem("tech_lab_material_title", title || "Lab Material");
    setShowUpload(false);

    // If there was a pending module, navigate to it
    if (pendingModule) {
      router.push(`/tech-lab/${pendingModule}`);
      setPendingModule(null);
    }
  };

  const handleClear = () => {
    setExtractedText("");
    setMaterialTitle("");
    localStorage.removeItem("tech_lab_source_text");
    localStorage.removeItem("tech_lab_material_title");
  };

  const handleModuleClick = (moduleId: string) => {
    if (!extractedText) {
      setPendingModule(moduleId);
      setShowUpload(true);
    } else {
      router.push(`/tech-lab/${moduleId}`);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <main className="min-h-screen pt-40 pb-20 px-6 relative overflow-hidden bg-background font-cairo">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Tech Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--primary) 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <Link href="/hub">
              <Button
                variant="ghost"
                className="mb-6 gap-2 font-black text-primary hover:bg-primary/10 rounded-xl"
              >
                <ArrowLeft
                  className={cn("w-5 h-5", language === "en" && "rotate-180")}
                />
                {t("quiz.returnToHub")}
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Microscope className="w-6 h-6" />
              </div>
              <span className="text-primary font-black uppercase tracking-widest text-sm">
                Mindar Ecosystem
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter"
            >
              <span className="text-primary italic">Tech Lab</span>{" "}
              {language === "ar" ? "المختبر التقني" : ""} 🧪
            </motion.h1>
            <p className="text-xl text-muted-foreground mt-6 font-bold max-w-2xl leading-relaxed">
              {language === "ar"
                ? "بيئة تعليمية متقدمة مصممة خصيصاً لطلاب هندسة وعلم الحاسوب. استكشف العتاد، البرمجيات، والشبكات بذكاء."
                : "A premium learning environment built for Computer Science & Engineering. Master logic, hardware, and code with AI visuals."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-4">
            {extractedText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 backdrop-blur-xl p-4 px-6 rounded-2xl border border-primary/20 flex items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="text-primary w-5 h-5" />
                  <div className="text-left">
                    <p className="text-[10px] font-black opacity-60 uppercase">
                      {language === "ar" ? "المادة النشطة" : "Active Material"}
                    </p>
                    <p className="text-sm font-black truncate max-w-[150px]">
                      {materialTitle}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="w-8 h-8 text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            <div className="hidden lg:block">
              <div className="bg-card/50 backdrop-blur-xl p-6 rounded-[2.5rem] border-2 border-primary/10 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 text-yellow-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black opacity-60 uppercase">
                      {language === "ar" ? "نمط المختبر" : "Lab Mode"}
                    </p>
                    <p className="text-lg font-black">
                      {language === "ar"
                        ? "تفاعلي وبصري"
                        : "Interactive & Visual"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showUpload ? (
            <motion.div
              key="upload-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <h2 className="text-4xl font-black mb-4">
                    {language === "ar"
                      ? "كيف ترغب في بدء المختبر؟"
                      : "How would you like to start the lab?"}
                  </h2>
                  <p className="text-xl text-muted-foreground font-bold leading-relaxed">
                    {language === "ar"
                      ? "يمكنك الاعتماد على مادتك العلمية كمرجع، أو الدخول مباشرة واستخدام أوامر الـ AI الذكية."
                      : "You can use your study material as a reference, or enter directly and use AI system commands."}
                  </p>

                  <div className="flex flex-col gap-4 pt-6">
                    <Button
                      onClick={() => {
                        if (pendingModule) {
                          router.push(`/tech-lab/${pendingModule}?mode=prompt`);
                          setPendingModule(null);
                          setShowUpload(false);
                        }
                      }}
                      className="h-20 rounded-3xl font-black gap-4 text-lg shadow-xl hover:scale-105 transition-all text-left justify-start px-8 bg-gradient-to-r from-purple-600 to-indigo-600 border-none"
                    >
                      <Sparkles className="w-8 h-8" />
                      <div>
                        <p>
                          {language === "ar"
                            ? "دخول مباشر (AI Prompt)"
                            : "Direct Entry (AI Prompt)"}
                        </p>
                        <p className="text-xs opacity-60 font-bold">
                          {language === "ar"
                            ? "ابدأ المختبر بدون ملف، فقط استخدم الأوامر"
                            : "Start without a file, use commands only"}
                        </p>
                      </div>
                    </Button>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 font-black opacity-40">
                          {language === "ar" ? "أو" : "OR"}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {}} // Just stay here for upload
                      className="h-20 rounded-3xl font-black gap-4 text-lg border-2 border-primary/30 hover:bg-primary/5 text-left justify-start px-8 bg-card/50"
                    >
                      <FileCheck className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-foreground">
                          {language === "ar"
                            ? "استخدام مادة علمية"
                            : "Use Study Material"}
                        </p>
                        <p className="text-xs opacity-70 font-bold text-muted-foreground">
                          {language === "ar"
                            ? "ارفع PDF أو PPTX لتحليلها برمجياً"
                            : "Upload PDF or PPTX for programmatic analysis"}
                        </p>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-3xl rounded-[3rem] border-2 border-primary/10 p-8 shadow-2xl">
                  <UploadSection
                    onTextReady={handleTextReady}
                    onClear={handleClear}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowUpload(false);
                    setPendingModule(null);
                  }}
                  className="font-bold gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === "ar" ? "العودة للمختبر" : "Back to Lab"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="modules-grid"
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {labModules.map((module) => (
                <motion.div key={module.id} variants={item}>
                  <Card
                    onClick={() => handleModuleClick(module.id)}
                    className="group relative h-[360px] cursor-pointer border-4 border-transparent hover:border-primary/20 transition-all duration-500 rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-xl shadow-2xl hover:translate-y-[-8px]"
                  >
                    <CardContent className="p-10 flex flex-col h-full relative z-10">
                      {/* Icon & Pattern */}
                      <div className="flex justify-between items-start mb-10">
                        <div
                          className={cn(
                            "w-20 h-20 rounded-[2rem] bg-gradient-to-br flex items-center justify-center text-white shadow-xl transform group-hover:rotate-12 transition-all duration-500",
                            module.color,
                          )}
                        >
                          <module.icon className="w-10 h-10" />
                        </div>
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full border border-primary/20">
                          {module.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1 space-y-4">
                        <h3 className="text-3xl font-black group-hover:text-primary transition-colors text-left">
                          {t(module.key)}
                        </h3>
                        <p className="text-lg text-muted-foreground font-bold leading-snug text-left">
                          {t(module.descKey)}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-between pt-8 border-t border-border/50">
                        <span className="text-primary font-black uppercase tracking-widest text-sm flex items-center gap-2">
                          {language === "ar" ? "دخول المختبر" : "Enter Lab"}
                        </span>
                        <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                          <ArrowRight
                            className={cn(
                              "w-6 h-6",
                              language === "ar" && "rotate-180",
                            )}
                          />
                        </div>
                      </div>

                      {/* Decorative Background Pattern */}
                      <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                        <module.pattern size={180} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        {!showUpload && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20 p-10 rounded-[3rem] bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/10 text-center"
          >
            <h2 className="text-3xl font-black mb-4">
              {language === "ar"
                ? "هل لديك فكرة لمختبر جديد؟"
                : "Have a new lab idea?"}
            </h2>
            <p className="text-xl text-muted-foreground font-bold mb-8">
              {language === "ar"
                ? "نحن نطور مَيندار باستمرار ليناسب احتياجاتك البرمجية."
                : "We are constantly evolving Mindar to suit your engineering needs."}
            </p>
            <Button className="h-14 px-10 rounded-2xl font-black text-lg gap-2">
              <Sparkles className="w-5 h-5" />
              {language === "ar" ? "اقترح ميزة" : "Suggest a feature"}
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
