"use client"

import React, { use } from 'react'
import { motion } from 'framer-motion'
import { Swords, Trophy, Timer, User, ShieldCheck, Flame, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function ChallengeRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  // Unwrap params using React.use() - for Next.js 15+ async params
  const resolvedParams = use(params)
  const roomId = resolvedParams.roomId

  // Try to load from localStorage first
  const localId = roomId.replace('room-', '')
  const savedData = typeof window !== 'undefined' ? localStorage.getItem(`challenge-room-${localId}`) : null
  const roomData = savedData ? JSON.parse(savedData) : null

  // Mock data for the challenge (fallback)
  const creator = { 
    name: roomData?.creator || "عمار", 
    score: roomData ? 0 : 95, 
    time: roomData ? "--:--" : "2:30" 
  }
  const challengeInfo = { 
    title: roomData?.title || "تحدي سلايدات هندسة البرمجيات",
    questionsCount: roomData?.questionsCount || 20,
    participants: roomData?.participants || 12
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Navigation */}
        <Link href="/challenge" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-500 mb-8 transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" />
            ارجع للرئيسية
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-8">
          
          {/* Main Room View */}
          <div className="space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative background icon */}
                <Swords className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-50 dark:text-slate-800/10 pointer-events-none" />

                <div className="relative z-10">
                    <div className={cn(
                        "inline-block px-4 py-2 rounded-full text-xs font-black mb-6 animate-pulse",
                        roomData?.type === 'رأس برأس' ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                        roomData?.type === 'عام للقاعة' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    )}>
                        {roomData?.type === 'رأس برأس' ? "تحدي رأس برأس مباشر 🔴" :
                         roomData?.type === 'عام للقاعة' ? "تحدي مفتوح للجميع 🌏" :
                         "نظام غرف مغلق 🏰"}
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black mb-6 text-slate-900 dark:text-slate-50 leading-tight">
                        {challengeInfo.title}
                    </h1>

                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                            <Timer className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-xs text-slate-500 mb-1">
                                {roomData?.type === 'عام للقاعة' ? "متوسط الوقت" : "الوقت الأفضل"}
                            </p>
                            <p className="font-black text-lg">{creator.time}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                            <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-green-500" />
                            <p className="text-xs text-slate-500 mb-1">الأسئلة</p>
                            <p className="font-black text-lg">{challengeInfo.questionsCount}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                            <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                            <p className="text-xs text-slate-500 mb-1">المتنافسين</p>
                            <p className="font-black text-lg">
                                {roomData?.type === 'رأس برأس' ? "1 ضد 1" : challengeInfo.participants}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="h-20 flex-1 rounded-2xl text-2xl font-black bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-[1.02] transition-transform">
                            ابدأ التورني (Start Quiz)
                        </Button>
                        <Button variant="outline" className="h-20 px-10 rounded-2xl font-black border-2">
                           عرض القوانين
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Motivation Tip */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                <Trophy className="w-12 h-12 text-blue-500 flex-shrink-0" />
                <div>
                    <h4 className="font-black text-blue-900 dark:text-blue-300 mb-1">نصيحة للمنافس</h4>
                    <p className="text-blue-800/70 dark:text-blue-400/70 text-sm font-medium">
                        السر مش بس بالجواب الصح، السر كمان بالسرعة. عمار جاب 95% بدقيقتين ونص، تقدر تكسر رقمه؟
                    </p>
                </div>
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl sticky top-24">
                <div className="p-6 bg-slate-900 dark:bg-slate-100">
                    <h3 className="text-white dark:text-slate-900 font-black text-xl flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        لوحة الصدارة
                    </h3>
                </div>
                <CardContent className="p-0">
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Creator Position */}
                        <li className="p-5 flex items-center gap-4 bg-yellow-50/50 dark:bg-yellow-900/10">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-black text-xs">1</div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 dark:text-slate-200">{creator.name} (المنشئ)</p>
                                <p className="text-xs text-slate-500">{creator.time}</p>
                            </div>
                            <p className="font-black text-xl text-yellow-600">{creator.score}</p>
                        </li>
                        {/* Mock Participants */}
                        {[
                          { name: "علي", score: 88, time: "3:10", pos: 2 },
                          { name: "سارة", score: 82, time: "2:45", pos: 3 },
                          { name: "أحمد", score: 75, time: "4:00", pos: 4 }
                        ].map((p) => (
                            <li key={p.name} className="p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-xs">{p.pos}</div>
                                <div className="flex-1">
                                    <p className="font-black text-slate-700 dark:text-slate-300">{p.name}</p>
                                    <p className="text-xs text-slate-500">{p.time}</p>
                                </div>
                                <p className="font-black text-xl text-slate-400">{p.score}</p>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
