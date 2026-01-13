"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Target } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface ChecklistProgressProps {
  completed: number;
  total: number;
}

export const ChecklistProgress: React.FC<ChecklistProgressProps> = ({ completed, total }) => {
  const { language, t } = useI18n();
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-primary/5 backdrop-blur-3xl p-8 rounded-[3rem] border-2 border-primary/20 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <Target className="w-48 h-48" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <Zap className="w-7 h-7 fill-current" />
            </div>
            <div>
              <h2 className="text-3xl font-black">{t('checklist.progress')}</h2>
              <p className="text-sm font-bold opacity-60">
                {language === 'ar' 
                  ? `أنجزت ${completed} من أصل ${total} مهمة حتى الآن` 
                  : `You've completed ${completed} of ${total} tasks so far`}
              </p>
            </div>
          </div>

          <div className="w-full h-4 bg-background/50 rounded-full overflow-hidden border border-border/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-emerald-500 shadow-lg shadow-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-background/50 rounded-[2.5rem] border border-border/50 backdrop-blur-md min-w-[140px]">
          <span className="text-5xl font-black text-primary">{percentage}%</span>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
            {language === 'ar' ? 'مكتمل' : 'Completed'}
          </span>
        </div>
      </div>
    </div>
  );
};
