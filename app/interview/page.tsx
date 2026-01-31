"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  History,
  ChevronRight,
  User,
  MessageSquareText,
  ShieldCheck,
  Zap,
  Globe,
  Brain,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import InterviewInterface from "@/components/interview/InterviewInterface";

export default function InterviewLanding() {
  const { t, language } = useI18n();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState("");
  const [interviewLanguage, setInterviewLanguage] = useState<"ar" | "en">("ar");
  const [isStarted, setIsStarted] = useState(false);
  const [cvFile, setCvFile] = useState<string | null>(null);
  const [cvText, setCvText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [step, setStep] = useState(1);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvFile(file.name);
    setIsParsing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Parse failed");
      const data = await res.json();
      setCvText(data.text);
    } catch (err) {
      console.error(err);
      setCvFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const domains = [
    {
      id: "tech",
      label: language === "ar" ? "تطوير البرمجيات" : "Software Engineering",
      icon: Globe,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "front-end",
      label: language === "ar" ? "برمجة الواجهات" : "Front-end Dev",
      icon: Zap,
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: "business",
      label: language === "ar" ? "ريادة الأعمال" : "Business & Startup",
      icon: Briefcase,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "hr",
      label: language === "ar" ? "موارد بشرية" : "HR & Management",
      icon: User,
      color: "from-emerald-500 to-green-600",
    },
    {
      id: "custom",
      label: language === "ar" ? "مجال مخصص" : "Custom Topic",
      icon: MessageSquareText,
      color: "from-purple-500 to-pink-600",
    },
  ];

  if (isStarted && selectedDomain) {
    return (
      <main className="min-h-screen pt-32 pb-20 px-6 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <InterviewInterface
              domain={
                selectedDomain === "custom" ? customDomain : selectedDomain
              }
              cvText={cvText}
              language={interviewLanguage}
            />
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-10 md:pb-20 px-4 md:px-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8 md:space-y-12"
            >
              <div className="space-y-4 md:space-y-6">
                <Badge className="px-4 py-1.5 bg-primary/10 text-primary border-none text-[10px] md:text-sm font-black rounded-full whitespace-nowrap">
                  {language === "ar"
                    ? "المقابلة الذكية الاحترافية 🚀"
                    : "Professional AI Interview 🚀"}
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight">
                  {language === "ar" ? (
                    <>
                      أثبت جدارتك في{" "}
                      <span className="text-primary italic">
                        مقابلاتك القادمة
                      </span>
                    </>
                  ) : (
                    <>
                      Master Your{" "}
                      <span className="text-primary italic">
                        Next Interview
                      </span>
                    </>
                  )}
                </h1>
                <p className="max-w-2xl mx-auto text-sm md:text-lg text-muted-foreground font-bold px-4">
                  {language === "ar"
                    ? "اختبر مهاراتك مع محاور ذكي يحاكي كبرى الشركات العالمية. ارفع سيرتك الذاتية وابدأ التحدي الآن."
                    : "Simulate real-world interviews with our AI experts. Upload your CV and start the challenge today."}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 max-w-6xl mx-auto px-4">
                {domains.map((domain) => (
                  <Card
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={cn(
                      "group cursor-pointer border transition-all duration-300 rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-2xl",
                      selectedDomain === domain.id
                        ? "border-primary bg-primary/5 ring-2 md:ring-4 ring-primary/10 scale-105"
                        : "border-border hover:border-primary/20 bg-card/50",
                    )}
                  >
                    <CardContent className="p-4 md:p-8 flex flex-col items-center gap-3 md:gap-6">
                      <div
                        className={cn(
                          "w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-xl group-hover:rotate-12 transition-transform duration-500",
                          domain.color,
                        )}
                      >
                        <domain.icon className="w-5 h-5 md:w-8 md:h-8" />
                      </div>
                      <h3 className="text-xs md:text-lg font-black">
                        {domain.label}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col items-center gap-6">
                <Button
                  disabled={!selectedDomain}
                  onClick={() => setStep(2)}
                  className="rounded-full h-12 md:h-16 px-8 md:px-12 text-sm md:text-xl font-black shadow-2xl hover:scale-105 transition-transform group"
                >
                  {language === "ar"
                    ? "المتابعة للخطوة التالية"
                    : "Continue to Next Step"}
                  <ArrowRight
                    className={cn(
                      "inline-block ml-2 w-4 h-4 md:w-6 md:h-6 transition-transform group-hover:translate-x-1",
                      language === "ar" ? "rotate-180" : "",
                    )}
                  />
                </Button>
                <Link
                  href="/hub"
                  className="text-muted-foreground hover:text-primary font-bold text-[10px] md:text-sm transition-colors uppercase tracking-widest"
                >
                  {language === "ar" ? "العودة للرئيسية" : "Back to Hub"}
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8 md:space-y-12 px-4"
            >
              <div className="flex items-center gap-4 mb-4 md:mb-8">
                <Button
                  variant="ghost"
                  className="rounded-full h-10 w-10 md:h-12 md:w-12 p-0"
                  onClick={() => setStep(1)}
                >
                  <ArrowRight
                    className={cn(
                      "w-5 h-5 md:w-6 md:h-6",
                      language === "ar" ? "" : "rotate-180",
                    )}
                  />
                </Button>
                <h2 className="text-xl md:text-3xl font-black">
                  {language === "ar"
                    ? "تخصيص المقابلة"
                    : "Interview Customization"}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Custom Topic Input */}
                {selectedDomain === "custom" && (
                  <div className="col-span-full space-y-4">
                    <div className="flex items-center gap-3">
                      <Brain className="text-primary w-5 h-5 md:w-6 md:h-6" />
                      <h4 className="text-lg md:text-xl font-black">
                        {language === "ar"
                          ? "ما هو المجال الدقيق؟"
                          : "What's the specific role?"}
                      </h4>
                    </div>
                    <Input
                      value={customDomain}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCustomDomain(e.target.value)
                      }
                      placeholder={
                        language === "ar"
                          ? "مثلاً: Front-end React Developer..."
                          : "e.g. Front-end React Developer..."
                      }
                      className="h-12 md:h-16 rounded-xl md:rounded-2xl border-2 border-primary/20 bg-card/50 text-base md:text-xl font-bold px-6 md:px-8 shadow-inner"
                    />
                  </div>
                )}

                {/* CV Upload Section */}
                <Card
                  onClick={() =>
                    !isParsing && document.getElementById("cv-upload")?.click()
                  }
                  className={cn(
                    "rounded-[2rem] md:rounded-[3rem] border-2 md:border-4 border-dashed bg-card/30 backdrop-blur-xl group transition-all cursor-pointer relative overflow-hidden",
                    cvFile
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-primary/20 hover:border-primary/40",
                    isParsing && "opacity-50 cursor-wait",
                  )}
                >
                  <input
                    id="cv-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                  />
                  <CardContent className="p-8 md:p-12 flex flex-col items-center text-center gap-4 md:gap-6">
                    <div
                      className={cn(
                        "w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-inner transition-transform",
                        cvFile
                          ? "bg-green-500 text-white"
                          : "bg-primary/10 text-primary group-hover:scale-110",
                      )}
                    >
                      {isParsing ? (
                        <div className="w-6 h-6 md:w-10 md:h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : cvFile ? (
                        <CheckCircle2 className="w-6 h-6 md:w-10 md:h-10" />
                      ) : (
                        <Upload className="w-6 h-6 md:w-10 md:h-10" />
                      )}
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <h4 className="text-lg md:text-2xl font-black">
                        {isParsing
                          ? language === "ar"
                            ? "جاري التحليل..."
                            : "Analyzing CV..."
                          : cvFile
                            ? language === "ar"
                              ? "تم رفع السيرة الذاتية ✅"
                              : "CV Uploaded ✅"
                            : language === "ar"
                              ? "ارفع سيرتك الذاتية"
                              : "Upload Your CV"}
                      </h4>
                      <p className="text-muted-foreground text-xs md:text-sm font-bold">
                        {cvFile
                          ? cvFile
                          : language === "ar"
                            ? "(اختياري) لتخصيص الأسئلة لخبراتك"
                            : "(Optional) To tailor questions to your experience"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Configuration Section */}
                <div className="space-y-6">
                  {/* Language Selection */}
                  <div className="p-4 md:p-6 bg-card/80 border border-border rounded-2xl md:rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      <Globe className="text-primary w-5 h-5 md:w-6 md:h-6" />
                      <h4 className="text-base md:text-lg font-black">
                        {language === "ar"
                          ? "لغة المقابلة"
                          : "Interview Language"}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={
                          interviewLanguage === "ar" ? "default" : "outline"
                        }
                        onClick={() => setInterviewLanguage("ar")}
                        className={cn(
                          "rounded-xl h-12 font-black border-2 transition-all",
                          interviewLanguage === "ar"
                            ? "border-primary shadow-lg scale-105"
                            : "border-border opacity-70",
                        )}
                      >
                        {language === "ar" ? "العربية" : "Arabic"}
                      </Button>
                      <Button
                        variant={
                          interviewLanguage === "en" ? "default" : "outline"
                        }
                        onClick={() => setInterviewLanguage("en")}
                        className={cn(
                          "rounded-xl h-12 font-black border-2 transition-all",
                          interviewLanguage === "en"
                            ? "border-primary shadow-lg scale-105"
                            : "border-border opacity-70",
                        )}
                      >
                        {language === "ar" ? "الإنجليزية" : "English"}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold text-center italic">
                      {language === "ar"
                        ? "سيتم طرح الأسئلة والرد باللغة المختارة"
                        : "Questions and responses will be in the selected language"}
                    </p>
                  </div>

                  {/* Start Interview Section */}
                  <div className="p-4 md:p-6 bg-card/80 border border-border rounded-2xl md:rounded-3xl space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity hidden md:block">
                      <Zap className="w-20 h-20 text-primary rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <Zap className="text-primary w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                      <h4 className="text-base md:text-lg font-black">
                        {language === "ar"
                          ? "جاهز للانطلاق؟"
                          : "Ready to Launch?"}
                      </h4>
                    </div>
                    <Button
                      disabled={selectedDomain === "custom" && !customDomain}
                      className="w-full h-14 rounded-2xl font-black text-lg bg-gradient-to-r from-primary to-indigo-600 shadow-xl transition-transform hover:scale-[1.02] active:scale-95 relative z-10"
                      onClick={() => setIsStarted(true)}
                    >
                      {language === "ar"
                        ? "ابدأ المقابلة المباشرة"
                        : "Start Live Interview"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Advanced Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 pt-6 md:pt-12">
                {[
                  {
                    icon: History,
                    label:
                      language === "ar" ? "جلسة مسجلة" : "Session Recorded",
                  },
                  {
                    icon: Sparkles,
                    label: language === "ar" ? "تحليل مباشر" : "Live Analysis",
                  },
                  {
                    icon: CheckCircle2,
                    label:
                      language === "ar" ? "تقرير تقييم" : "Evaluation Report",
                  },
                ].map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 md:gap-3 text-muted-foreground font-black text-[8px] md:text-[10px] uppercase tracking-widest bg-primary/5 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-primary/5"
                  >
                    <feat.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span>{feat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
