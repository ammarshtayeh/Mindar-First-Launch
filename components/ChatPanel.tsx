"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  X,
  Loader2,
  User,
  Bot,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ text, isOpen, onClose }: ChatPanelProps) {
  const { t, language } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          query: userMessage,
          history: messages,
          language: language === "ar" ? "ar" : "en",
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            language === "ar"
              ? "عذراً، حدث خطأ في الاتصال."
              : "Sorry, a connection error occurred.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: language === "ar" ? -400 : 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: language === "ar" ? -400 : 400 }}
          className={cn(
            "fixed top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-4xl border-l border-border/50 flex flex-col",
            language === "ar" ? "left-0" : "right-0",
          )}
        >
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">
                  {language === "ar" ? "اسأل Mindar" : "Ask Mindar"}
                </h3>
                <p className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {language === "ar" ? "نشط الآن" : "Active Now"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-6">
                <MessageSquare className="w-16 h-16 mb-4" />
                <h4 className="text-lg font-black">
                  {language === "ar" ? "أنا جاهز لمساعدتك" : "Ready to help"}
                </h4>
                <p className="text-sm font-bold">
                  {language === "ar"
                    ? "اسأل أي شيء حول المادة وسأجيبك بناءً عليها."
                    : "Ask anything about the material and I will answer accordingly."}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center",
                    msg.role === "user"
                      ? "bg-secondary"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "p-4 rounded-2xl max-w-[85%] text-sm font-bold shadow-sm",
                    msg.role === "user"
                      ? "bg-secondary text-foreground rounded-tr-none"
                      : "bg-primary/5 text-foreground rounded-tl-none border border-primary/10",
                  )}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-secondary/30 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs font-black animate-pulse uppercase tracking-widest">
                    {t("common.loading")}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-6 border-t border-border/50 bg-secondary/20">
            <div className="relative flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  language === "ar"
                    ? "اكتب سؤالك هنا..."
                    : "Type your question..."
                }
                className="pr-12 h-14 rounded-2xl bg-card border-2 border-primary/10 focus:border-primary/40 shadow-inner font-bold"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 h-10 w-10 rounded-xl p-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="mt-4 text-[9px] font-black text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Mindar AI -{" "}
              {language === "ar"
                ? "إجابات دقيقة من ملفاتك"
                : "Precise context-aware answers"}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
