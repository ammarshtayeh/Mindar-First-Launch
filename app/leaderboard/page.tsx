"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star, Flame, Loader2, ArrowLeft, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getGlobalLeaderboard, UserProfile } from "@/lib/services/dbService"

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await getGlobalLeaderboard(20)
        setLeaders(data)
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-black text-slate-500">جاري تحميل قائمة الأبطال...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
            <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-[2.5rem] mb-6 shadow-xl text-yellow-600"
            >
                <Trophy className="w-12 h-12" />
            </motion.div>
            <h1 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600">
                لوحة الشرف العالمية
            </h1>
            <p className="text-xl text-slate-500 font-bold">لائحة الأبطال الأكثر اجتهاداً وتحدياً في مندار 🏆</p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex flex-col sm:flex-row items-end justify-center gap-4 mb-20 px-4">
            {/* 2nd Place */}
            {leaders[1] && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 w-full"
              >
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-t-[3rem] border-x-2 border-t-2 border-slate-100 dark:border-slate-800 text-center relative pt-12 min-h-[200px] shadow-lg">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center text-slate-500 text-3xl font-black">
                        {leaders[1].displayName?.[0] || '2'}
                      </div>
                      <div className="absolute top-6 right-6 bg-slate-300 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-black">2</div>
                      <h3 className="font-black text-lg truncate">{leaders[1].displayName}</h3>
                      <p className="text-blue-500 font-bold">{leaders[1].xp} XP</p>
                  </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {leaders[0] && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-1 w-full order-first sm:order-none"
              >
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-t-[3rem] border-x-2 border-t-2 border-yellow-200 dark:border-yellow-900/30 text-center relative pt-16 min-h-[250px] shadow-2xl scale-110 z-10">
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/50 border-4 border-yellow-400 overflow-hidden flex items-center justify-center text-yellow-600 text-4xl font-black">
                         {leaders[0].displayName?.[0] || '1'}
                      </div>
                      <div className="absolute top-6 right-6 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black animate-bounce shadow-lg">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-2xl truncate">{leaders[0].displayName}</h3>
                      <p className="text-orange-600 font-black text-xl">{leaders[0].xp} XP</p>
                      <div className="mt-4 flex justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                  </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {leaders[2] && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 w-full"
              >
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-t-[3rem] border-x-2 border-t-2 border-slate-100 dark:border-slate-800 text-center relative pt-12 min-h-[180px] shadow-lg">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/30 border-4 border-orange-200 dark:border-orange-900/30 overflow-hidden flex items-center justify-center text-orange-600 text-3xl font-black">
                        {leaders[2].displayName?.[0] || '3'}
                      </div>
                      <div className="absolute top-6 right-6 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black">3</div>
                      <h3 className="font-black text-lg truncate">{leaders[2].displayName}</h3>
                      <p className="text-orange-500 font-bold">{leaders[2].xp} XP</p>
                  </div>
              </motion.div>
            )}
        </div>

        {/* Rest of the List */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-black text-xl flex items-center gap-2">
                    <Medal className="w-6 h-6 text-slate-400" />
                    باقي المتصدرين
                </h3>
                <span className="text-xs font-black text-slate-400">تحديث لحظي ⚡</span>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaders.slice(3).map((user, idx) => (
                    <motion.li 
                      key={user.uid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (idx + 3) * 0.05 }}
                      className="p-6 flex items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-sm border-2 border-slate-200 dark:border-slate-700">
                            {idx + 4}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                {user.displayName}
                                {user.badges?.includes("Genius") && <Award className="w-4 h-4 text-purple-500" />}
                            </h4>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-orange-500" />
                                    المستوى {user.level || 1}
                                </p>
                                <p className="text-xs font-bold text-slate-400">
                                    {user.quizzesTaken || 0} كويز
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-2xl text-slate-900 dark:text-white">{user.xp}</p>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Global XP</p>
                        </div>
                    </motion.li>
                ))}
                {leaders.length <= 3 && (
                    <li className="p-20 text-center text-slate-400 font-bold">بانتظار انضمام المزيد من المنافسين... ⏳</li>
                )}
            </ul>
        </div>

        <div className="mt-12 text-center">
            <Link href="/hub">
                <Button variant="outline" className="h-14 px-8 rounded-2xl font-black gap-2 border-2">
                    <ArrowLeft className="w-5 h-5" />
                    العودة للمركز
                </Button>
            </Link>
        </div>
      </div>
    </div>
  )
}
