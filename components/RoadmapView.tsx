"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  ChevronRight,
  Map,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
}

interface RoadmapViewProps {
  milestones: Milestone[];
}

export function RoadmapView({ milestones }: RoadmapViewProps) {
  const { language } = useI18n();

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "text-green-500 bg-green-500/10";
      case "Medium":
        return "text-amber-500 bg-amber-500/10";
      case "Hard":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="space-y-12 py-12">
      <div className="flex items-center gap-6 mb-16">
        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3">
          <Map className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-4xl font-black">
            {language === "ar" ? "خارطة الطريق الدراسية" : "Study Roadmap"}
          </h2>
          <p className="text-xl font-bold text-muted-foreground">
            {language === "ar"
              ? "رحلتك نحو الإتقان الكامل للمادة"
              : "Your journey towards full material mastery"}
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-1 bg-gradient-to-b from-primary/40 via-primary/10 to-transparent -translate-x-1/2" />

        {milestones.map((ms, i) => (
          <motion.div
            key={ms.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative mb-24 flex flex-col md:flex-row items-center gap-8 pl-24 md:pl-0",
              i % 2 === 0 ? "md:flex-row-reverse" : "",
            )}
          >
            {/* Milestone Point */}
            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-[1.5rem] bg-background border-4 border-primary shadow-2xl z-10 flex items-center justify-center font-black text-2xl">
              {i + 1}
            </div>

            {/* Content Card */}
            <div className="w-full md:w-[45%] bg-card/50 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-primary/5 shadow-3xl hover:border-primary/20 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    getDifficultyColor(ms.difficulty),
                  )}
                >
                  {ms.difficulty}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-black opacity-40">
                  <Clock className="w-3 h-3" />
                  {ms.estimatedTime}
                </div>
              </div>

              <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">
                {ms.title}
              </h3>
              <p className="text-sm font-bold text-muted-foreground mb-6 leading-relaxed">
                {ms.description}
              </p>

              <div className="space-y-3">
                {ms.tasks.map((task, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl border border-transparent hover:border-primary/10 transition-colors"
                  >
                    <Circle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span className="text-xs font-bold">{task}</span>
                  </div>
                ))}
              </div>

              <button className="mt-8 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black flex items-center justify-center gap-2 group/btn relative overflow-hidden">
                <span className="relative z-10">
                  {language === "ar" ? "ابدأ هذه المرحلة" : "Start Milestone"}
                </span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
              </button>
            </div>

            {/* Spacer for mobile alignment */}
            <div className="hidden md:block w-[45%]" />
          </motion.div>
        ))}

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
            <Flame className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-black mb-2">
            {language === "ar" ? "خط النهاية!" : "Finish Line!"}
          </h3>
          <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em]">
            Goal: Mastery Reached
          </p>
        </div>
      </div>
    </div>
  );
}
