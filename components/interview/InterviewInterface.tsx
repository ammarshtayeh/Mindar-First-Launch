"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Bot,
  BrainCircuit,
  Timer,
  Flag,
  CheckCircle2,
  Brain,
  MessageSquareText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

interface Message {
  id: string;
  role: "system" | "user" | "ai";
  content: string;
  timestamp: Date;
  type?: "question" | "feedback" | "diagram";
  reasoning_details?: any; // Add this for OpenRouter reasoning support
}

export default function InterviewInterface({
  domain,
  cvText = "",
  language: interviewLanguage,
}: {
  domain: string;
  cvText?: string;
  language?: "ar" | "en";
}) {
  const { language: appLanguage } = useI18n();
  const language = interviewLanguage || appLanguage;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        interviewLanguage === "ar"
          ? `أهلاً بك. أنا هنا لدعمك كموجه في مجال ${domain}. سنبدأ ببعض الأساسيات الجوهرية لنتأكد من قوة قواعدك، ثم نتدرج معاً بلطف. إذا واجهت أي صعوبة أو أردت معرفة إجابة سؤال، لا تتردد في طلب ذلك. هل نبدأ بأول خطوة؟`
          : `Welcome. I am here to support you as a mentor in ${domain}. We will start with some core fundamentals to ensure your foundation is strong, then progress gently together. If you encounter any difficulty or want to know the answer to a question, don't hesitate to ask. Shall we take the first step?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, feedback]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg.content,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
            reasoning_details: m.reasoning_details, // Pass back to maintain context
          })),
          domain,
          cvText,
          language: language === "ar" ? "ar" : "en",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to get response");
      }

      const data = await res.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.response,
        reasoning_details: data.reasoning_details, // Store reasoning if provided
        timestamp: new Date(),
        type: data.response.includes("?") ? "question" : undefined,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "ai",
        content:
          language === "ar"
            ? `⚠️ عذراً، حدث خطأ: ${err.message}`
            : `⚠️ Sorry, an error occurred: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (messages.length < 3) {
      alert(
        language === "ar"
          ? "المقابلة قصيرة جداً للتقييم."
          : "Interview is too short for evaluation.",
      );
      return;
    }

    setIsEnding(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query:
            language === "ar"
              ? "لقد انتهت المقابلة. قم بتحليل أدائي كمرشح بناءً على هذه المحادثة، وقدم لي تقريراً مختصراً يتضمن: 1. نقاط القوة، 2. نقاط الضعف، 3. الدرجة النهائية من 100."
              : "The interview is over. Analyze my performance as a candidate based on this conversation and provide a concise report including: 1. Strengths, 2. Areas for improvement, 3. Final score out of 100.",
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
            reasoning_details: m.reasoning_details,
          })),
          domain,
          cvText,
          language: language === "ar" ? "ar" : "en",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to get response");
      }

      const data = await res.json();
      setFeedback(data.response);
    } catch (err: any) {
      console.error(err);
      alert(
        language === "ar"
          ? `حدث خطأ أثناء إنهاء المقابلة: ${err.message}`
          : `Error ending interview: ${err.message}`,
      );
    } finally {
      setIsEnding(false);
    }
  };

  const userMessagesCount = messages.filter((m) => m.role === "user").length;
  const getPhase = () => {
    if (userMessagesCount < 2)
      return language === "ar" ? "المرحلة 1: الانطلاقة" : "Phase 1: Entry";
    if (userMessagesCount < 5)
      return language === "ar"
        ? "المرحلة 2: العمق التقني"
        : "Phase 2: Tech Depth";
    if (userMessagesCount < 7)
      return language === "ar"
        ? "المرحلة 3: سيناريو الضغط"
        : "Phase 3: Stress Scenario";
    return language === "ar"
      ? "المرحلة 4: التقييم الختامي"
      : "Phase 4: Final Evaluation";
  };
  const getProgress = () => Math.min((userMessagesCount / 8) * 100, 100);

  return (
    <div className="flex flex-col h-[85vh] md:h-[80vh] bg-card/30 backdrop-blur-2xl rounded-2xl md:rounded-[3rem] border-2 md:border-4 border-primary/5 overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/50 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-primary/10 animate-ping opacity-20" />
            <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
          </div>
          <div>
            <h3 className="font-black text-sm md:text-lg uppercase tracking-tight truncate max-w-[150px] md:max-w-none">
              {language === "ar" ? "الموجه الذكي" : "AI Mentor"}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-none text-[8px] md:text-[10px] h-4 md:h-5"
              >
                {getPhase()}
              </Badge>
              <div className="w-12 md:w-20 h-1 md:h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>
            <div className="mt-1">
              <span className="text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">
                {domain} • {cvText ? "CV ATTACHED" : "GENERAL"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 font-bold text-[9px] md:text-xs uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Timer className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span>
              {isEnding
                ? language === "ar"
                  ? "جاري التحليل..."
                  : "ANALYZING..."
                : language === "ar"
                  ? "مباشر"
                  : "LIVE SESSION"}
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={handleEndInterview}
            disabled={isEnding || !!feedback}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full px-3 md:px-4 h-8 md:h-10 text-[9px] md:text-xs"
          >
            <Flag className="w-3 h-3 md:w-4 md:h-4" />
            <span>{language === "ar" ? "إنهاء" : "End"}</span>
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scrollbar-hide"
      >
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-6 md:space-y-8 py-4 md:py-10"
            >
              <div className="text-center space-y-3 md:space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                  <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black">
                  {language === "ar"
                    ? "تقرير الأداء الفني"
                    : "Performance Report"}
                </h2>
                <p className="text-muted-foreground text-xs md:text-base font-bold italic">
                  {language === "ar"
                    ? "تحليل دقيق لأدائك في المقابلة"
                    : "Detailed analysis of your interview performance"}
                </p>
              </div>

              <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-2 md:border-4 border-primary/10 bg-card/50 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
                <CardContent className="space-y-4 md:space-y-6 pt-0 md:pt-6">
                  <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none font-bold text-base md:text-lg leading-relaxed whitespace-pre-line text-foreground/80">
                    {feedback}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-6 border-t border-border/50">
                    <Button
                      onClick={() => window.location.reload()}
                      className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg bg-primary shadow-xl"
                    >
                      {language === "ar" ? "إعادة المحاولة" : "Try Again"}
                    </Button>
                    <Link href="/hub" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-base md:text-lg border-2"
                      >
                        {language === "ar" ? "الرئيسية" : "Home"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 md:space-y-8 pb-10"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%]",
                    msg.role === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                      msg.role === "ai"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {msg.role === "ai" ? (
                      <Bot className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm relative group bg-card/80",
                      msg.role === "ai"
                        ? "bg-primary/5 text-foreground border border-primary/10 shadow-inner"
                        : "bg-muted/50 text-foreground border border-border",
                    )}
                  >
                    {msg.type === "question" && (
                      <Badge className="mb-2 md:mb-3 bg-primary/20 text-primary border-none font-black text-[8px] md:text-[10px] uppercase">
                        Technical Question
                      </Badge>
                    )}
                    <p className="text-sm md:text-lg leading-relaxed font-bold">
                      {msg.content}
                    </p>
                    <span className="absolute bottom-2 right-4 text-[8px] text-muted-foreground font-black opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {(isLoading || isEnding) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 md:gap-4 items-center text-muted-foreground font-black text-[8px] md:text-[10px] uppercase tracking-widest pl-11 md:pl-14"
                >
                  <div className="flex gap-1">
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                  <span>
                    {isEnding
                      ? language === "ar"
                        ? "جاري توليد التقرير النهائي..."
                        : "Generating final report..."
                      : language === "ar"
                        ? "المحاور يفكر..."
                        : "Interviewer is thinking..."}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      {!feedback && (
        <div className="p-4 md:p-8 border-t border-border/50 bg-background/50 backdrop-blur-md">
          <div className="relative flex items-center gap-2 md:gap-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading || isEnding}
              placeholder={
                isLoading
                  ? language === "ar"
                    ? "جاري المعالجة..."
                    : "Processing..."
                  : language === "ar"
                    ? "اكتب إجابتك هنا..."
                    : "Type your answer..."
              }
              className="h-12 md:h-16 pl-4 md:pl-6 pr-14 md:pr-20 rounded-xl md:rounded-[2rem] border-2 border-primary/5 focus-visible:ring-primary/20 bg-card/50 text-base md:text-lg font-bold disabled:opacity-50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || isEnding}
              className="absolute right-1 md:right-2 h-10 w-10 md:h-12 md:w-12 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 disabled:grayscale"
            >
              <Send
                className={cn(
                  "w-4 h-4 md:w-5 md:h-5",
                  language === "ar" ? "rotate-180" : "",
                )}
              />
            </Button>
          </div>
          <p className="mt-2 text-[8px] md:text-[10px] text-center text-muted-foreground font-black uppercase tracking-[0.1em] md:tracking-[0.2em] opacity-40">
            Professional Mode • Text-Only Precision
          </p>
        </div>
      )}
    </div>
  );
}
