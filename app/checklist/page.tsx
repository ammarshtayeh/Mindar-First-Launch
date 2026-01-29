"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  ListChecks,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { StudyChecklist } from "@/lib/types/checklist";
import { subscribeToChecklists } from "@/lib/services/checklistService";
import { CreativeEmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export default function ChecklistListPage() {
  const { t, language } = useI18n();
  const router = useRouter();
  const { user } = useAuth();

  const [checklists, setChecklists] = useState<StudyChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChecklists(user.uid, (data) => {
      setChecklists(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-44 pb-20 px-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-primary font-black bg-primary/10 px-4 py-1.5 rounded-full w-fit mb-4"
            >
              <ListChecks className="w-5 h-5" />
              <span>{t("checklist.title")}</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              {language === "ar"
                ? 'خططك <span className="text-primary italic">الذكية</span> 📋'
                : 'Your <span className="text-primary italic">Smart</span> Plans 📋'}
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/hub")}
            className="h-14 px-8 rounded-2xl border-border font-black gap-2 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <ArrowLeft
              className={`w-5 h-5 ${language === "en" ? "-rotate-180" : ""}`}
            />
            <span>{t("common.back")}</span>
          </Button>
        </div>

        {checklists.length === 0 ? (
          <div className="py-20">
            <CreativeEmptyState
              icon={ListChecks}
              title={t("checklist.emptyState")}
              description={
                language === "ar"
                  ? "ابدأ برفع مادة دراسية في الـ Hub وتوليد خطة ذكية."
                  : "Start by uploading material in the Hub and generating a smart plan."
              }
            />
            <div className="mt-8 text-center">
              <Button
                onClick={() => router.push("/hub")}
                className="h-16 px-10 rounded-[2rem] font-black text-lg gap-3 shadow-xl"
              >
                <Sparkles className="w-6 h-6" />
                {t("common.getStarted")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {checklists.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    onClick={() => router.push(`/checklist/${c.materialId}`)}
                    className="group cursor-pointer border-4 border-transparent hover:border-primary/20 transition-all duration-500 rounded-[3rem] overflow-hidden bg-card/40 backdrop-blur-xl shadow-2xl hover:scale-[1.02]"
                  >
                    <CardContent className="p-6 md:p-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                          <ListChecks className="w-8 h-8" />
                        </div>
                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
                          <TrendingUp className="w-3 h-3" />
                          {c.progress}%
                        </div>
                      </div>

                      <h3 className="text-2xl font-black mb-4 line-clamp-2 min-h-[4rem]">
                        {c.materialTitle}
                      </h3>

                      <div className="space-y-4 mb-8">
                        <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.progress}%` }}
                            className="h-full bg-primary"
                          />
                        </div>
                        <p className="text-sm font-bold opacity-60">
                          {t("checklist.tasksCompleted", {
                            completed: c.items.filter((i) => i.isCompleted)
                              .length,
                            total: c.items.length,
                          })}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-border/30">
                        <span className="text-primary font-black uppercase tracking-widest text-[10px]">
                          {language === "ar" ? "عرض القائمة" : "View Checklist"}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          <ChevronRight
                            className={`w-5 h-5 ${language === "ar" ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
