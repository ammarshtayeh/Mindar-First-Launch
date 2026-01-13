"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Target, Zap, CheckCircle, BrainCircuit, BookOpen, Clock } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

interface ActivitySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (settings: { numQuestions: number, difficulty: string, types: string[] }) => void;
    type: 'quiz' | 'flashcards' | 'challenge' | 'coding' | 'mindmap';
}

export function ActivitySettingsModal({ isOpen, onClose, onStart, type }: ActivitySettingsModalProps) {
    const { t, language } = useI18n()
    const [numQuestions, setNumQuestions] = useState(10)
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['multiple-choice', 'true-false'])

    const toggleType = (id: string) => {
        setSelectedTypes(prev => 
            prev.includes(id) 
            ? (prev.length > 1 ? prev.filter(t => t !== id) : prev) 
            : [...prev, id]
        )
    }

    const quizTypes = [
        { id: 'multiple-choice', label: language === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice' },
        { id: 'true-false', label: language === 'ar' ? 'صح أو خطأ' : 'True / False' },
        { id: 'fill-in-the-blanks', label: language === 'ar' ? 'أكمل الفراغ' : 'Fill in the Blanks' },
        { id: 'explanation', label: language === 'ar' ? 'شرح / سؤال مقالي' : 'Explanation / Essay' }
    ]

    const handleStart = () => {
        onStart({ numQuestions, difficulty, types: selectedTypes })
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl bg-card border-4 border-primary/20 rounded-[3.5rem] shadow-3xl overflow-hidden relative z-10"
                    >
                        {/* Header */}
                        <div className="p-8 pb-0 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    {type === 'quiz' ? <BrainCircuit className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight capitalize">
                                        {type === 'quiz' ? t('common.quiz') : t('common.flashcards')}
                                    </h2>
                                    <p className="text-sm font-bold text-muted-foreground opacity-60">
                                        {language === 'ar' ? 'قم بتخصيص جلستك الدراسية' : 'Customize your study session'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-muted rounded-2xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Question Count */}
                            <div>
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    {t('upload.questionsCount')}: {numQuestions}
                                </h3>
                                <input
                                    type="range" min="1" max="20" step="1"
                                    value={numQuestions}
                                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    {t('upload.difficulty')}
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`p-4 rounded-2xl border-2 font-black text-sm capitalize transition-all duration-300 ${difficulty === level ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-card/50 border-border hover:border-primary/20'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question Types - Only for Quiz/Challenge */}
                            {(type === 'quiz' || type === 'challenge') && (
                                <div>
                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-primary fill-current" />
                                        {language === 'ar' ? 'أنواع الأسئلة' : 'Question Types'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {quizTypes.map((t) => {
                                             const isSelected = selectedTypes.includes(t.id);
                                             return (
                                                 <button
                                                     key={t.id}
                                                     onClick={() => toggleType(t.id)}
                                                     className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between group ${isSelected ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' : 'bg-card/50 border-border opacity-60 hover:opacity-100 hover:border-primary/30'}`}
                                                 >
                                                     <span className="font-black text-xs">{t.label}</span>
                                                     <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/20' : 'border-muted-foreground/30 group-hover:border-primary/50'}`}>
                                                         {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                                                     </div>
                                                 </button>
                                             );
                                         })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-muted/30 border-t border-border/50">
                            <Button 
                                onClick={handleStart}
                                className="w-full h-16 rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/20"
                            >
                                <Zap className="w-6 h-6 fill-current" />
                                {language === 'ar' ? 'ابدأ الآن' : 'Start Now'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
