"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  Search, 
  Filter,
  Loader2,
  ListChecks
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast-provider'
import { StudyChecklist, ChecklistItem, Priority } from '@/lib/types/checklist'
import { subscribeToChecklists, updateChecklistItemStatus, deleteChecklist } from '@/lib/services/checklistService'
import { logActivity } from '@/lib/services/dbService'
import { ChecklistCard } from '@/components/checklist/ChecklistCard'
import { ChecklistProgress } from '@/components/checklist/ChecklistProgress'
import { CreativeEmptyState } from '@/components/ui/empty-state'

export default function ChecklistDetailPage() {
  const { materialId } = useParams() as { materialId: string };
  const { t, language } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [checklist, setChecklist] = useState<StudyChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    if (!user) return;

    // Use common subscription and find the matching materialId
    // Optimization: In a real app, you might want a specific listener for one doc
    const unsubscribe = subscribeToChecklists(user.uid, (checklists) => {
      const current = checklists.find(c => c.materialId === materialId || c.id === materialId);
      if (current) {
        setChecklist(current);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, materialId]);

  const filteredItems = useMemo(() => {
    if (!checklist) return [];
    return checklist.items
      .filter(item => {
        const matchesSearch = item.task.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = 
          filter === 'all' ? true : 
          filter === 'completed' ? item.isCompleted : !item.isCompleted;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        // Sort by completion status, then priority
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      });
  }, [checklist, searchQuery, filter]);

  const handleToggle = async (itemId: string, isCompleted: boolean) => {
    if (!checklist) return;
    try {
      await updateChecklistItemStatus(checklist.id, itemId, isCompleted);
      if (isCompleted) {
        logActivity(user!.uid, user!.displayName || "Student", 'action_completed_study_task');
        toast({
          type: 'success',
          message: language === 'ar' ? 'أحسنت! خطوة أخرى للنجاح 🚀' : 'Well done! One more step to success 🚀'
        });
      }
    } catch (error) {
      toast({ type: 'error', message: 'Failed to update status' });
    }
  };

  const handleDelete = async () => {
    if (!checklist || !window.confirm(t('checklist.deleteConfirm'))) return;
    try {
      await deleteChecklist(checklist.id);
      router.push('/hub');
    } catch (error) {
      toast({ type: 'error', message: 'Failed to delete checklist' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="min-h-screen pt-44 pb-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <CreativeEmptyState 
            icon={ListChecks}
            title={language === 'ar' ? 'لم نجد هذه القائمة' : 'Checklist not found'}
            description={language === 'ar' ? 'تأكد من اختيار المادة الصحيحة من الـ Hub.' : 'Make sure you selected the correct material from the Hub.'}
          />
          <div className="mt-8 text-center">
             <Button onClick={() => router.push('/hub')} className="rounded-2xl px-8 h-14 font-black">
                <ArrowLeft className={`w-5 h-5 mr-2 ${language === 'ar' ? '-scale-x-100' : ''}`} />
                {t('common.returnToHub')}
             </Button>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = checklist.items.filter(i => i.isCompleted).length;

  return (
    <main className="min-h-screen pt-44 pb-20 px-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-12">
            <Button 
                variant="outline" 
                onClick={() => router.push('/hub')}
                className="h-12 px-6 rounded-2xl font-black gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
                <ArrowLeft className={`w-5 h-5 transition-transform ${language === 'ar' ? '-scale-x-100' : 'group-hover:-translate-x-1'}`} />
                <span>{t('common.back')}</span>
            </Button>

            <Button 
                variant="outline" 
                onClick={handleDelete}
                className="h-12 px-4 rounded-2xl font-black gap-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
                <Trash2 className="w-5 h-5" />
            </Button>
        </div>

        {/* Title Section */}
        <div className="mb-12">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-emerald-600 font-black bg-emerald-500/10 px-4 py-1.5 rounded-full w-fit mb-4 border border-emerald-500/20"
            >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">{language === 'ar' ? 'خطة دراسية ذكية' : 'Smart Study Plan'}</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {checklist.materialTitle}
            </h1>
        </div>

        {/* Progress Card */}
        <div className="mb-12">
            <ChecklistProgress completed={completedCount} total={checklist.items.length} />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-40 group-focus-within:opacity-100 transition-opacity">
                    <img src="/logo-2026.png" className="w-full h-full object-contain scale-110" alt="" />
                </div>
                <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search')}
                    className="pl-14 h-14 rounded-2xl border-2 border-border/50 focus:border-primary/50 transition-all font-bold"
                />
            </div>
            <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-2xl border border-border/50">
                {(['all', 'pending', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${filter === f ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/30'}`}
                    >
                        {t(`checklist.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                    </button>
                ))}
            </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
                {filteredItems.map(item => (
                    <ChecklistCard 
                      key={item.id} 
                      item={item} 
                      onToggle={handleToggle}
                    />
                ))}
            </AnimatePresence>

            {filteredItems.length === 0 && (
                <div className="py-20">
                    <CreativeEmptyState 
                        icon={ListChecks}
                        title={t('checklist.emptyState')}
                        description={searchQuery ? (language === 'ar' ? 'حاول تغيير البحث' : 'Try changing your search query') : ""}
                    />
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
