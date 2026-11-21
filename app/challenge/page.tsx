"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Upload,
  Copy,
  Check,
  Users,
  ShieldAlert,
  Sparkles,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createRoom } from "@/lib/services/roomsService";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth-form";
import { logActivity } from "@/lib/services/dbService";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";

const STAKES = [
  "الخسران يعزم على شاورما 🥙",
  "الفائز اله قهوة مجاناً ☕",
  "الخسران يكتب ملخص الشابتر الجاي 📝",
  "الفائز هو 'نيرد' الدفعة الرسمي 🤓",
  "الخسران يحل الواجب الجاي 📚",
];

export default function ChallengeCreatePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState("رأس برأس");
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([
    "multiple-choice",
  ]);
  const [numQuestions, setNumQuestions] = useState(15);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Viral Card State
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [currentStake, setCurrentStake] = useState(STAKES[0]);

  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  // --- PDF Parsing Setup ---
  // We use a CDN for the worker to avoid complex Webpack config
  // Note: We use dynamic import inside the function to avoid SSR issues

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Dynamically import pdfjs-dist
      const pdfJS = await import("pdfjs-dist");

      // precise version match is important
      pdfJS.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfJS.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfJS.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" "); // Simple join

        // Add basic formatting helper
        fullText += `\n--- Page ${i} ---\n${pageText}\n`;
      }

      return fullText;
    } catch (e: any) {
      console.error("PDF Parsing Error:", e);
      throw new Error("فشل قراءة ملف PDF. قد يكون الملف محمياً أو تالفاً.");
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      let text = "";

      // 1. Client-Side Parsing Strategy
      if (file.name.toLowerCase().endsWith(".pdf")) {
        console.log("Parsing PDF locally...");
        text = await extractTextFromPDF(file);

        if (!text || text.trim().length < 50) {
          throw new Error(
            "لم يتم العثور على نصوص واضحة في الملف. تأكد أن الملف ليس صورة ممسوحة ضوئياً.",
          );
        }
      }
      // 2. Server-Side Parsing Fallback (for DOCX, PPTX)
      else {
        const formData = new FormData();
        formData.append("file", file);

        const parseRes = await fetch("/api/parse", {
          method: "POST",
          body: formData,
        });
        if (!parseRes.ok) {
          const errData = await parseRes
            .json()
            .catch(() => ({ error: "Parse failed" }));
          throw new Error(errData.error || "فشل تحليل الملف");
        }
        const data = await parseRes.json();
        text = data.text;
      }

      // 3. Generate Quiz
      // Truncate text to avoid Vercel 4.5MB payload limit and match server limit
      const MAX_CHARS = 60000;
      const processedText = text.slice(0, MAX_CHARS);

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: processedText,
          numQuestions,
          types: selectedQuestionTypes,
          language: "Arabic", // Or detect
          mode:
            typeof window !== "undefined"
              ? localStorage.getItem("mindar_learning_mode") || "exam"
              : "exam",
        }),
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({ error: "Gen failed" }));
        throw new Error(err.error || "فشل إنشاء التحدي");
      }

      const quizData = await genRes.json();

      const roomName = `تحدي: ${file.name}`;
      const creatorName =
        user.displayName || user.email?.split("@")[0] || "Student";

      const roomId = await createRoom(
        roomName,
        user.uid,
        creatorName,
        quizData,
      );

      // Log activity
      logActivity(user.uid, creatorName, "action_joined_challenge");

      const roomLink = `${window.location.origin}/challenge/${roomId}`;
      setGeneratedLink(roomLink);
      setCurrentStake(STAKES[Math.floor(Math.random() * STAKES.length)]);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "حدث خطأ غير متوقع");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCard = async () => {
    if (cardRef.current === null) {
      return;
    }
    setIsDownloadingCard(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `mindar-challenge-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("فشل تحميل البطاقة");
    } finally {
      setIsDownloadingCard(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startChallenge = () => {
    if (generatedLink) {
      const url = new URL(generatedLink);
      window.location.href = url.pathname;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl mb-6 shadow-xl text-red-600 dark:text-red-400">
            <Swords className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 to-red-600">
            تتحداني؟ (Challenge Me)
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto">
            ارفع ملفاتك، اعمل امتحان، وابعث الرابط لصاحبك.. خلينا نشوف مين فيكم
            "شطّور" ومين "لسا مش دارس"! 😉
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.pptx"
            />
            <Card
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "h-full border-2 border-dashed bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group transition-all cursor-pointer",
                isDragging
                  ? "border-red-500 bg-red-50/50 dark:bg-red-900/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-red-500/50",
                file &&
                  "border-green-500/50 bg-green-50/50 dark:bg-green-900/10",
              )}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[300px] relative">
                {file && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="absolute top-4 right-4 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all transform group-hover:rotate-12",
                    file
                      ? "bg-green-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-red-500 group-hover:text-white",
                  )}
                >
                  {file ? (
                    <FileText className="w-8 h-8" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>

                <h3 className="text-xl font-black mb-2">
                  {file ? "تم اختيار الملف!" : "1. اختار الملفات"}
                </h3>
                <p className="text-slate-500 text-center font-medium px-4">
                  {file
                    ? file.name
                    : "ارفع PDF أو السلايدات اللي بدك التحدي يكون فيها"}
                </p>

                {file && (
                  <div className="mt-4 px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                    جاري التجهيز للتحدي...
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-black mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                تخصيص الأسئلة
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-3">
                    عدد الأسئلة:{" "}
                    <span className="text-red-500 text-lg">{numQuestions}</span>
                  </p>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500 mb-3">
                    أنواع الأسئلة (سيتم التوزيع بالتساوي):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "multiple-choice", label: "اختيارات" },
                      { id: "true-false", label: "صح/خطأ" },
                      { id: "fill-in-the-blanks", label: "أكمل الفراغ" },
                      { id: "short-essay", label: "مقالي قصير" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (selectedQuestionTypes.includes(t.id)) {
                            if (selectedQuestionTypes.length > 1) {
                              setSelectedQuestionTypes((prev) =>
                                prev.filter((x) => x !== t.id),
                              );
                            }
                          } else {
                            setSelectedQuestionTypes((prev) => [...prev, t.id]);
                          }
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                          selectedQuestionTypes.includes(t.id)
                            ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-purple-500/30",
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-black mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                نوع التحدي
              </h3>
              <div className="flex gap-2">
                {["رأس برأس", "عام للقاعة", "نظام غرف"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                      selectedType === t
                        ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-red-500/30",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-black mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                شروط وقوانين
              </h3>
              <ul className="text-sm space-y-2 text-slate-500 font-medium">
                <li>• ممنوع تفتح جوجل</li>
                <li>• وقت محدد لكل سؤال</li>
                <li>• اللي بخسر بعزم الفريق على شاورما 🥙</li>
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          {!generatedLink ? (
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !file}
              className={cn(
                "h-20 px-12 text-2xl font-black rounded-3xl transition-all transform hover:scale-105",
                file
                  ? "bg-red-600 hover:bg-red-700 shadow-[0_20px_50px_rgba(220,38,38,0.3)]"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none",
              )}
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <Sparkles className="animate-spin w-6 h-6" />
                  <span>جاري تحمية الأجواء...</span>
                </div>
              ) : (
                "إصنع رابط التحدي الآن!"
              )}
            </Button>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 bg-green-50 dark:bg-green-900/20 border-2 border-green-500/50 rounded-[3rem] shadow-2xl overflow-hidden relative"
            >
              <h3 className="text-2xl font-black text-green-700 dark:text-green-400 mb-4">
                التحدي جاهز للبدء! 🔥
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-green-200 dark:border-green-800 shadow-inner">
                <code className="text-black dark:text-slate-200 font-mono text-xs sm:text-sm break-all flex-1 text-right font-bold">
                  {generatedLink}
                </code>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadCard}
                    size="sm"
                    variant="destructive"
                    className="rounded-xl shadow-lg gap-2 font-black animate-pulse"
                    disabled={isDownloadingCard}
                  >
                    <Swords className="w-4 h-4" />
                    {isDownloadingCard ? "جاري التصميم..." : "بطاقة المبارزة"}
                  </Button>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-500 hover:text-white transition-all gap-2 font-black"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "تم النسخ" : "نسخ"}
                  </Button>
                  <Button
                    onClick={startChallenge}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 rounded-xl"
                  >
                    ابدأ التحدي
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Hidden Viral Card Template */}
        <div
          style={{
            position: "fixed",
            top: -9999,
            left: -9999,
            width: 0,
            height: 0,
            overflow: "hidden",
          }}
        >
          <div
            ref={cardRef}
            className="w-[1080px] h-[1920px] bg-slate-900 text-white flex flex-col items-center relative overflow-hidden font-cairo"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-red-600/20 to-transparent" />
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-red-900/40 to-transparent" />

            {/* Header */}
            <div className="mt-20 text-center z-10 w-full flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Mindar"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="inline-block p-6 bg-red-600 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.5)] mb-8">
                <Swords className="w-32 h-32 text-white" />
              </div>
              <h1 className="text-8xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                I Challenge You!
              </h1>
              <p className="text-4xl text-red-400 font-bold mt-4 uppercase tracking-[1em]">
                Mindar Battle
              </p>
            </div>

            {/* VS Section */}
            <div className="flex-1 w-full flex flex-col justify-center items-center z-10 relative">
              <div className="w-full grid grid-cols-2 gap-0 px-20">
                <div className="text-center">
                  <div className="w-40 h-40 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-slate-700">
                    <span className="text-6xl">😈</span>
                  </div>
                  <h2 className="text-5xl font-black text-white mb-2">
                    {user?.displayName || "The Challenger"}
                  </h2>
                  <p className="text-3xl text-slate-400 font-bold">Ready</p>
                </div>
                <div className="text-center opacity-50">
                  <div className="w-40 h-40 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-slate-700 border-dashed">
                    <span className="text-6xl">😨</span>
                  </div>
                  <h2 className="text-5xl font-black text-white mb-2">You?</h2>
                  <p className="text-3xl text-slate-400 font-bold">Scared?</p>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <h1 className="text-[15rem] font-black text-white/10 italic">
                  VS
                </h1>
              </div>
            </div>

            {/* File Info */}
            <div className="z-10 bg-slate-800/50 backdrop-blur-3xl px-12 py-8 rounded-[3rem] border border-slate-700 mb-20 text-center border-l-8 border-l-red-500">
              <p className="text-3xl text-slate-400 font-bold uppercase mb-2">
                Topic
              </p>
              <h3 className="text-5xl font-black text-white max-w-3xl leading-tight">
                {file?.name.slice(0, 30)}...
              </h3>
            </div>

            {/* Stakes & QR */}
            <div className="w-full bg-white text-slate-900 rounded-t-[5rem] p-20 flex flex-col items-center text-center z-20 shadow-2xl">
              <div className="mb-12">
                <p className="text-4xl font-black text-red-600 uppercase mb-4 tracking-widest">
                  The Stakes
                </p>
                <h2 className="text-6xl font-black text-slate-900 leading-tight">
                  "{currentStake}"
                </h2>
              </div>

              <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl">
                {generatedLink && (
                  <QRCodeSVG
                    value={generatedLink}
                    size={300}
                    level="H"
                    bgColor="#0f172a"
                    fgColor="#ffffff"
                  />
                )}
              </div>
              <p className="mt-8 text-3xl font-bold text-slate-500">
                Scan to Accept
              </p>

              <div className="mt-12 flex items-center gap-4 text-slate-400 opacity-50">
                <Sparkles className="w-8 h-8" />
                <span className="text-2xl font-bold">Powered by Mindar AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <AuthForm
              onSuccess={() => setShowAuthModal(false)}
              onClose={() => setShowAuthModal(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
