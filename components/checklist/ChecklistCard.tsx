"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, Tag, MoreVertical, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ChecklistItem, Priority } from '@/lib/types/checklist'
import { useI18n } from '@/lib/i18n'

interface ChecklistCardProps {
  item: ChecklistItem;
  onToggle: (itemId: string, isCompleted: boolean) => void;
  onDelete?: (itemId: string) => void;
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-emerald-500'
};

const priorityLabels: Record<string, Record<Priority, string>> = {
  ar: { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' },
  en: { high: 'High', medium: 'Medium', low: 'Low' }
};

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ item, onToggle, onDelete }) => {
  const { language } = useI18n();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className={`overflow-hidden border-2 transition-all duration-300 ${item.isCompleted ? 'bg-secondary/20 border-transparent opacity-75' : 'bg-card border-border hover:border-primary/30 shadow-lg'}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <button 
              onClick={() => onToggle(item.id, !item.isCompleted)}
              className={`mt-1 transition-transform active:scale-90 ${item.isCompleted ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              {item.isCompleted ? <CheckCircle2 className="w-8 h-8 fill-primary/10" /> : <Circle className="w-8 h-8" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${priorityColors[item.priority]}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {priorityLabels[language][item.priority]}
                  </span>
                </div>
                {onDelete && (
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className={`text-xl font-black mb-2 leading-tight ${item.isCompleted ? 'line-through opacity-50' : ''}`}>
                {item.task}
              </h3>
              
              {item.description && (
                <p className={`text-sm font-medium mb-4 text-muted-foreground ${item.isCompleted ? 'opacity-30' : ''}`}>
                  {item.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {item.relatedPages && item.relatedPages.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1 rounded-lg text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{language === 'ar' ? 'صفحة' : 'Page'} {item.relatedPages.join(', ')}</span>
                  </div>
                )}
                {item.relatedTopics && item.relatedTopics.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-lg text-xs font-bold opacity-70">
                    <Tag className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{item.relatedTopics[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
