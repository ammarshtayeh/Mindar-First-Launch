"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { UserActivity } from "@/lib/services/dbService";
import { cn } from "@/lib/utils";

interface MasteryHeatmapProps {
  activities: UserActivity[];
}

export function MasteryHeatmap({ activities }: MasteryHeatmapProps) {
  const { t, language } = useI18n();

  const days = useMemo(() => {
    const today = new Date();
    const lastYear = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 364,
    );

    // Group activities by date string
    const counts: Record<string, number> = {};
    activities.forEach((act) => {
      if (act.timestamp) {
        const date = act.timestamp.toDate().toLocaleDateString("en-CA"); // YYYY-MM-DD
        counts[date] = (counts[date] || 0) + 1;
      }
    });

    const grid = [];
    let current = new Date(lastYear);
    while (current <= today) {
      const dateStr = current.toLocaleDateString("en-CA");
      grid.push({
        date: dateStr,
        count: counts[dateStr] || 0,
        day: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }
    return grid;
  }, [activities]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/50";
    if (count < 2) return "bg-primary/20";
    if (count < 4) return "bg-primary/40";
    if (count < 6) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <div className="bg-card/50 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-primary/5 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black">
            {language === "ar" ? "سجل الإنجاز" : "Mastery Heatmap"}
          </h3>
          <p className="text-sm font-bold text-muted-foreground">
            {language === "ar"
              ? "استمرارية دراستك خلال العام"
              : "Your study consistency over the last year"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black opacity-60">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/70" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-4 no-scrollbar">
        <div className="flex gap-1.5 min-w-[800px]">
          {/* We'll group by weeks roughly for display */}
          {Array.from({ length: 53 }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1.5">
              {days.slice(weekIdx * 7, (weekIdx + 1) * 7).map((day, dayIdx) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIdx * 7 + dayIdx) * 0.001 }}
                  className={cn(
                    "w-3.5 h-3.5 rounded-sm cursor-help transition-all hover:ring-2 hover:ring-primary/40",
                    getColor(day.count),
                  )}
                  title={`${day.date}: ${day.count} activities`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-muted-foreground opacity-40">
        <span>
          {new Date().toLocaleDateString(
            language === "ar" ? "ar-EG" : "en-US",
            { month: "short", year: "numeric" },
          )}
        </span>
        <span>
          {new Date().toLocaleDateString(
            language === "ar" ? "ar-EG" : "en-US",
            { month: "short", year: "numeric" },
          )}
        </span>
      </div>
    </div>
  );
}
