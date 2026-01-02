"use client"

import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { Brain, Target, Zap, BookOpen, Stethoscope, Pill, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface AnalyticsDashboardProps {
  topicPerformance: { topic: string; score: number; total: number; percentage: number }[];
  overallScore: number;
  totalQuestions: number;
}

export function AnalyticsDashboard({ topicPerformance, overallScore, totalQuestions }: AnalyticsDashboardProps) {
  const { t, language } = useI18n()
  const radarData = topicPerformance.map(t => ({
    subject: t.topic,
    A: t.percentage,
    fullMark: 100
  }))

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
      {/* Radar Chart for Topic Strength */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[3rem] p-10 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <Target className="w-8 h-8 text-primary" />
          <h3 className="text-2xl font-black">خارطة القوة والضعف</h3>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 'bold' }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar Chart for Details */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[3rem] p-10 shadow-xl flex flex-col"
      >
        <div className="flex items-center gap-4 mb-8">
          <Brain className="w-8 h-8 text-purple-500" />
          <h3 className="text-2xl font-black">تفاصيل للأذكياء</h3>
        </div>

        <div className="flex-1 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicPerformance}>
              <XAxis 
                dataKey="topic" 
                tick={false}
              />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border p-4 rounded-2xl shadow-2xl">
                        <p className="font-black text-primary">{data.topic}</p>
                        <p className="font-bold">{data.percentage}% صح</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="percentage" radius={[10, 10, 10, 10]}>
                {topicPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">أقوى موضوع</span>
                </div>
                <p className="font-black text-lg truncate">
                    {[...topicPerformance].sort((a,b) => b.percentage - a.percentage)[0]?.topic || '...'}
                </p>
            </div>
            <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/20">
                <div className="flex items-center gap-2 text-red-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">محتاج مراجعة</span>
                </div>
                <p className="font-black text-lg truncate">
                    {[...topicPerformance].sort((a,b) => a.percentage - b.percentage)[0]?.topic || '...'}
                </p>
            </div>
        </div>
      </motion.div>
 
      {/* Smart Medic Prescription (New) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/5 backdrop-blur-3xl border-2 border-primary/20 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group"
      >
        {/* Background visual */}
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <Stethoscope className="w-64 h-64" />
        </div>
 
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                            <Stethoscope className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black">{t('medic.title')}</h3>
                            <p className="text-xl text-muted-foreground font-bold">{t('medic.diagnosis')}: {
                                overallScore / totalQuestions >= 0.9 ? t('medic.good') :
                                overallScore / totalQuestions >= 0.6 ? t('medic.warn') :
                                t('medic.critical')
                            }</p>
                        </div>
                    </div>
 
                    <div className="bg-background/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-border/50">
                        <h4 className="text-2xl font-black mb-4 flex items-center gap-3">
                            <Pill className="text-primary w-6 h-6" />
                            {t('medic.prescription')}
                        </h4>
                        <ul className="space-y-4">
                            {topicPerformance.filter(t => t.percentage < 70).slice(0, 2).map((topic, idx) => (
                                <li key={idx} className="flex items-start gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                    <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-black text-red-600 dark:text-red-400">
                                            {language === 'ar' ? `راجع موضوع "${topic.topic}" فورا` : `Review "${topic.topic}" immediately`}
                                        </p>
                                        <p className="text-sm font-bold opacity-70">
                                            {language === 'ar' ? 'درجتك فيه أقل من المتوقع. جرب تدرس البطاقات التعليمية الخاصة بهذا الجزء.' : 'Your score here is below average. Try studying the relevant flashcards.'}
                                        </p>
                                    </div>
                                </li>
                            ))}
                            {topicPerformance.filter(t => t.percentage >= 70).length === topicPerformance.length && (
                                <li className="flex items-start gap-3 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                    <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-black text-green-600 dark:text-green-400">
                                            {language === 'ar' ? 'أنت في حالة ممتازة!' : 'You are in top shape!'}
                                        </p>
                                        <p className="text-sm font-bold opacity-70">
                                            {language === 'ar' ? 'استمر في مراجعة البطاقات للحفاظ على هذا المستوى.' : 'Keep reviewing flashcards to maintain this level.'}
                                        </p>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
 
                <div className="w-full md:w-72 aspect-square bg-primary/20 rounded-[3rem] border-4 border-primary/30 flex items-center justify-center p-10 relative overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                    <Brain className="w-full h-full text-primary relative z-10" />
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  )
}
