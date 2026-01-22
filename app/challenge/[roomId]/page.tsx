"use client";

import React, { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Trophy,
  Timer,
  User,
  ShieldCheck,
  Flame,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  subscribeToRoom,
  joinRoom,
  RoomData,
  Participant,
  startQuizRoom,
} from "@/lib/services/roomsService";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth-form";
import { ChallengeQuiz } from "@/components/challenge-quiz";

export default function ChallengeRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;

  const { user, loading: authLoading } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomId, (data) => {
      setRoomData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (user && roomData && !roomData.participants[user.uid]) {
      joinRoom(
        roomId,
        user.uid,
        user.displayName || user.email?.split("@")[0] || "Student",
      );
    }
  }, [user, roomData, roomId]);

  const handleStart = async () => {
    try {
      await startQuizRoom(roomId);
    } catch (e) {
      alert("فشل بدء التحدي، حاول مرة أخرى.");
    }
  };

  const handleQuizFinish = (score: number) => {
    setFinalScore(score);
    setIsFinished(true);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        <p className="font-black text-slate-500">جاري دخول القاعة...</p>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShieldCheck className="w-20 h-20 text-slate-200 mb-4" />
        <h1 className="text-3xl font-black text-slate-800">
          عذراً، الغرفة غير موجودة
        </h1>
        <p className="text-slate-500 font-bold">
          تأكد من الرابط أو اطلب من صاحب التحدي رابط جديد
        </p>
        <Link href="/challenge">
          <Button className="mt-4 rounded-2xl h-14 px-8 font-black">
            ارجع لمصنع التحديات
          </Button>
        </Link>
      </div>
    );
  }

  const participantsList = Object.values(roomData.participants || {}).sort(
    (a, b) => b.score - a.score,
  );
  const creator = roomData.participants[roomData.creatorId];
  const isCreator = user?.uid === roomData.creatorId;

  // --- RENDERING LOGIC ---

  // 1. Finished State
  if (isFinished) {
    return (
      <div className="min-h-screen pt-40 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-3">أحسنت صنعاً! 🔥</h1>
          <p className="text-2xl font-bold text-slate-500 mb-8">
            نتيجتك النهائية هي:{" "}
            <span className="text-red-500">{finalScore}</span>
          </p>
          <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
            <h3 className="font-black text-xl mb-4">لوحة الصدارة الحية</h3>
            <ul className="space-y-3">
              {participantsList.slice(0, 5).map((p, i) => (
                <li
                  key={p.uid}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800"
                >
                  <span className="font-bold">
                    {i + 1}. {p.displayName}
                  </span>
                  <span className="font-black text-red-500">{p.score}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/challenge" className="mt-12 inline-block">
            <Button className="h-16 px-12 rounded-2xl text-xl font-black">
              تحدي جديد؟
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // 2. Active Quiz State
  if (roomData.status === "active" && user) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center">
        <ChallengeQuiz
          roomId={roomId}
          userId={user.uid}
          quizData={roomData.quizData}
          onFinish={handleQuizFinish}
        />

        {/* Real-time Side Leaderboard (Floating) */}
        <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:block w-72">
          <Card className="rounded-[2rem] shadow-2xl border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white font-black text-center">
              أجواء المنافسة 🔥
            </div>
            <ul className="p-2 space-y-1">
              {participantsList.map((p, i) => (
                <li
                  key={p.uid}
                  className={cn(
                    "flex justify-between p-3 rounded-xl",
                    p.uid === user.uid
                      ? "bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200"
                      : "",
                  )}
                >
                  <span className="font-bold text-sm">
                    {i + 1}. {p.displayName}
                  </span>
                  <span className="font-black text-red-500">{p.score}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  // 3. Waiting/Lobby State
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/challenge"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-red-500 mb-8 transition-colors font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          ارجع للرئيسية
        </Link>

        {!user && (
          <div className="mb-8 p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-right">
              <ShieldCheck className="w-10 h-10 text-orange-500" />
              <div>
                <h4 className="font-black text-orange-900 dark:text-orange-400">
                  سجل دخولك لتشارك!
                </h4>
                <p className="text-orange-800/70 dark:text-orange-500/70 text-sm font-bold">
                  لازم تسجل عشان تظهر في لوحة المتصدرين وتنافس أصحابك.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="rounded-xl h-12 px-6 bg-orange-500 hover:bg-orange-600 font-black text-white"
            >
              تسجيل دخول سريع
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-8">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden"
            >
              <Swords className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-50 dark:text-slate-800/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-block px-4 py-2 rounded-full text-xs font-black mb-6 animate-pulse bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  {roomData.status === "waiting"
                    ? "بانتظار المنافسين 🔴"
                    : "تحدي مشتعل حالياً 🔥"}
                </div>
                <h1 className="text-4xl sm:text-5xl font-black mb-6 text-black dark:text-slate-50 leading-tight">
                  {roomData.name}
                </h1>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                    <User className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-xs text-slate-500 mb-1">المنشئ</p>
                    <p className="font-black text-sm truncate text-slate-950 dark:text-slate-200">
                      {creator?.displayName || "مجهول"}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                    <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-xs text-slate-500 mb-1">الأسئلة</p>
                    <p className="font-black text-lg">
                      {roomData.quizData?.questions?.length || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                    <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-xs text-slate-500 mb-1">المتنافسين</p>
                    <p className="font-black text-lg">
                      {participantsList.length}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {isCreator ? (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="h-20 flex-1 rounded-2xl text-2xl font-black bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                    >
                      <Sparkles className="w-6 h-6" />
                      ابدأ التحدي للجميع!
                    </Button>
                  ) : (
                    <div className="h-20 flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-black text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700">
                      بانتظار المنشئ ليبدأ التحدي... ⏳
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="h-20 px-10 rounded-2xl font-black border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-black text-xl"
                  >
                    عرض القوانين
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
              <Trophy className="w-12 h-12 text-blue-500 flex-shrink-0" />
              <div>
                <h4 className="font-black text-blue-900 dark:text-blue-300 mb-1">
                  نصيحة للمنافس
                </h4>
                <p className="text-blue-800/70 dark:text-blue-400/70 text-sm font-medium">
                  السر مش بس بالجواب الصح، السر كمان بالسرعة. المنافسة قوية
                  والكل شايف نقاطك، لا تفضحنا! 😉
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl sticky top-24">
              <div className="p-6 bg-slate-900 dark:bg-slate-100">
                <h3 className="text-white dark:text-slate-900 font-black text-xl flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  لوحة الصدارة المباشرة
                </h3>
              </div>
              <CardContent className="p-0">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                  {participantsList.map((p, idx) => (
                    <li
                      key={p.uid}
                      className={cn(
                        "p-5 flex items-center gap-4 transition-colors",
                        p.uid === user?.uid
                          ? "bg-red-50 dark:bg-red-900/10"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs",
                          idx === 0
                            ? "bg-yellow-400"
                            : idx === 1
                              ? "bg-slate-300"
                              : idx === 2
                                ? "bg-orange-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500",
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 dark:text-slate-200">
                          {p.displayName}
                          {p.uid === roomData.creatorId && (
                            <span className="text-[10px] mr-2 text-red-500">
                              (المنشئ)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          جاري الانتظار...
                        </p>
                      </div>
                      <p className="font-black text-xl text-slate-900 dark:text-white">
                        {p.score}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <AuthForm
              onSuccess={() => setShowAuthModal(false)}
              onClose={() => setShowAuthModal(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
