"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Calendar,
  Award,
  ChevronRight,
  Loader2,
  ArrowLeft,
  FileText,
  Trash2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getQuizHistory,
  clearQuizHistory,
  deleteQuizResult,
  QuizResult,
} from "@/lib/services/dbService";
import { useAuth } from "@/hooks/useAuth";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const data = await getQuizHistory(user.uid);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      if (user) fetchHistory();
      else setLoading(false);
    }
  }, [user, authLoading]);

  const handleClearHistory = async () => {
    if (!user) return;
    if (confirm("هل أنت متأكد من حذف سجل الاختبارات بالكامل؟")) {
      await clearQuizHistory(user.uid);
      setHistory([]);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (confirm("هل أنت متأكد من حذف هذا الاختبار؟")) {
      try {
        await deleteQuizResult(id);
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-black text-slate-500">
          جاري استرجاع ذكرياتك الدراسية...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <History className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
          سجل الاختبارات متاح للأعضاء فقط
        </h1>
        <p className="text-slate-500 font-bold max-w-md">
          سجل دخولك الآن لتبدأ بحفظ تقدمك ومراجعة اختباراتك السابقة في أي وقت.
        </p>
        <Link href="/">
          <Button className="h-14 px-8 rounded-2xl font-black">
            تسجيل الدخول / العودة للرئيسية
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                سجل اختباراتي
              </h1>
              <p className="text-slate-500 font-bold text-sm">
                تم توثيق كافة إنجازاتك الدراسية هنا. 🔥
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleClearHistory}
                className="h-12 px-6 rounded-xl font-black gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-2 border-red-500/10 hover:border-red-500"
              >
                <Trash2 className="w-5 h-5" />
                حذف السجل
              </Button>
            )}
            <Link href="/hub">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl font-black gap-2 border-2"
              >
                <ArrowLeft className="w-5 h-5" />
                العودة للمركز
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-xs font-bold text-slate-400 mb-1">
              إجمالي الاختبارات
            </p>
            <p className="text-2xl font-black">{history.length}</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-xs font-bold text-slate-400 mb-1">
              متوسط الدرجات
            </p>
            <p className="text-2xl font-black">
              {history.length > 0
                ? (
                    history.reduce((acc, curr) => acc + curr.percentage, 0) /
                    history.length
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-xs font-bold text-slate-400 mb-1">أعلى درجة</p>
            <p className="text-2xl font-black">
              {history.length > 0
                ? Math.max(...history.map((h) => h.percentage)).toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <AnimatePresence>
            {history.map((item, idx) => (
              <motion.div
                key={item.timestamp?.seconds || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group overflow-hidden">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-transform group-hover:scale-110",
                        item.percentage >= 90
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                          : item.percentage >= 60
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30",
                      )}
                    >
                      <span className="text-xl">{item.score}</span>
                      <span className="text-[10px] opacity-60">
                        /{item.totalQuestions}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 truncate mb-1">
                        {item.quizTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.timestamp?.toDate
                            ? item.timestamp
                                .toDate()
                                .toLocaleDateString("ar-EG")
                            : "تاريخ غير معروف"}
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] uppercase">
                          {item.quizData?.mode === "challenge"
                            ? "تحدي"
                            : "اختبار فردي"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <div className="text-right hidden sm:block">
                        <p
                          className={cn(
                            "text-2xl font-black",
                            item.percentage >= 90
                              ? "text-green-500"
                              : item.percentage >= 60
                                ? "text-blue-500"
                                : "text-red-500",
                          )}
                        >
                          {item.percentage.toFixed(0)}%
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Score
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        onClick={(e) => handleDeleteItem(item.id || "", e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {history.length === 0 && (
            <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">
                لا يوجد اختبارات سابقة حتى الآن. بادر بحل أول اختبار لتظهر
                نتيجتك هنا!
              </p>
              <Link href="/hub">
                <Button className="mt-6 rounded-xl font-black">
                  ابدأ أول اختبار
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
