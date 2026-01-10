"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ShieldCheck, History, BrainCircuit, Lock } from 'lucide-react'
import { AuthForm } from '@/components/auth-form'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

interface AuthLimitModalProps {
    isOpen: boolean
    onClose: () => void
}

export const AuthLimitModal = ({ isOpen, onClose }: AuthLimitModalProps) => {
    const { t, language } = useI18n()

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl bg-background rounded-[3rem] shadow-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
                    >
                        {/* Left Side: Marketing/Benefits */}
                        <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 border-r border-border/50">
                            <div className="mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h2 className="text-4xl font-black text-foreground mb-4 leading-tight">
                                    {language === 'ar' ? 'فعلت المذاكرة الصح؟ 🚀' : 'Ready for the real deal? 🚀'}
                                </h2>
                                <p className="text-xl text-muted-foreground font-bold">
                                    {language === 'ar' 
                                        ? 'الوصول ضيف محدود، لكن كعضو في مندار فلك عالم تاني من الميزات.' 
                                        : 'Guest access is limited, but as a Mindar member, a whole new world awaits.'}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <BenefitItem 
                                    icon={BrainCircuit}
                                    title={language === 'ar' ? 'توليد غير محدود' : 'Unlimited Generation'}
                                    desc={language === 'ar' ? 'اصنع ما لا نهاية من الاختبارات والبطاقات.' : 'Create endless quizzes and flashcards.'}
                                />
                                <BenefitItem 
                                    icon={History}
                                    title={language === 'ar' ? 'أرشيفك الشخصي' : 'Your Personal Archive'}
                                    desc={language === 'ar' ? 'احفظ كل محاولاتك وتابع تقدمك بمرور الوقت.' : 'Save all your attempts and track progress.'}
                                />
                                <BenefitItem 
                                    icon={ShieldCheck}
                                    title={language === 'ar' ? 'تحليلات الذكاء الاصطناعي' : 'AI Analysis'}
                                    desc={language === 'ar' ? 'اعرف نقاط ضعفك وكيف تقويها فوراً.' : 'Identify your weak spots and improve them instantly.'}
                                />
                            </div>
                        </div>

                        {/* Right Side: Auth Form */}
                        <div className="p-8 lg:p-12 flex flex-col items-center justify-center relative">
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="w-full max-w-sm">
                                <div className="lg:hidden text-center mb-8">
                                     <h2 className="text-3xl font-black mb-2">{language === 'ar' ? 'باقي خطوة وحدة!' : 'One step left!'}</h2>
                                     <p className="text-muted-foreground font-bold">{language === 'ar' ? 'سجل دخولك لفتح كل ميزات مندار.' : 'Login to unlock all Mindar features.'}</p>
                                </div>
                                <AuthForm onSuccess={onClose} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

function BenefitItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-1 w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-black text-lg text-foreground">{title}</h4>
                <p className="text-sm text-muted-foreground font-bold leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
