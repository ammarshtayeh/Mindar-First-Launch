"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  ArrowRight,
  Video,
  MessageSquare,
  Highlighter,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { createRoom } from "@/lib/services/roomService";
import { useToast } from "@/components/ui/toast-provider";

export default function RoomsPage() {
  const { t, language } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!user) {
      toast({
        type: "error",
        message:
          language === "ar" ? "يجب تسجل الدخول أولاً" : "Please login first",
      });
      return;
    }
    if (!newRoomName.trim()) return;

    setIsCreating(true);
    try {
      const roomId = await createRoom(user.uid, newRoomName);
      router.push(`/rooms/${roomId}`);
    } catch (err) {
      toast({ type: "error", message: "Failed to create room" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) return;
    router.push(`/rooms/${joinRoomId.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen pt-44 pb-20 px-6 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-primary font-black bg-primary/10 px-4 py-1.5 rounded-full w-fit mb-4"
            >
              <Users className="w-5 h-5" />
              <span>
                {language === "ar" ? "الغرف الدراسية" : "Study Rooms"}
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              {language === "ar" ? (
                <>
                  ادرس <span className="text-primary italic">معاً</span> 🤝
                </>
              ) : (
                <>
                  Study <span className="text-primary italic">Together</span> 🤝
                </>
              )}
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/hub")}
            className="h-14 px-8 rounded-2xl border-border font-black gap-2 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <ArrowLeft
              className={`w-5 h-5 ${language === "en" ? "-rotate-180" : ""}`}
            />
            <span>{t("common.back")}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-[3rem] border-4 border-transparent bg-card/40 backdrop-blur-xl shadow-2xl p-8 h-full">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mb-6">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4">
                  {language === "ar" ? "إنشاء غرفة جديدة" : "Create New Room"}
                </h3>
                <p className="text-muted-foreground font-bold mb-8">
                  {language === "ar"
                    ? "أنشئ غرفة خاصة وشارك الرابط مع أصدقائك"
                    : "Start a private room and share the ID with your friends"}
                </p>

                <div className="space-y-4 mt-auto">
                  <Input
                    placeholder={
                      language === "ar" ? "اسم الغرفة..." : "Room Name..."
                    }
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="h-14 rounded-2xl border-2 border-border focus:border-primary px-6 font-bold"
                  />
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!newRoomName || isCreating}
                    className="w-full h-16 rounded-[2rem] font-black text-lg gap-3 shadow-xl"
                  >
                    {isCreating
                      ? "..."
                      : language === "ar"
                        ? "إنشاء الغرفة"
                        : "Create Room"}
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-[3rem] border-4 border-transparent bg-card/40 backdrop-blur-xl shadow-2xl p-8 h-full">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-[1.5rem] flex items-center justify-center mb-6">
                  <ArrowRight className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-4">
                  {language === "ar" ? "انضم لغرفة" : "Join a Room"}
                </h3>
                <p className="text-muted-foreground font-bold mb-8">
                  {language === "ar"
                    ? "أدخل رمز الغرفة للانضمام فوراً"
                    : "Enter a room ID to join your friends"}
                </p>

                <div className="space-y-4 mt-auto">
                  <Input
                    placeholder={
                      language === "ar"
                        ? "رمز الغرفة (مثل: ABC123)"
                        : "Room ID (e.g., ABC123)"
                    }
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="h-14 rounded-2xl border-2 border-border focus:border-blue-500 px-6 font-bold uppercase"
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!joinRoomId}
                    className="w-full h-16 rounded-[2rem] font-black text-lg gap-3 shadow-xl bg-blue-600 hover:bg-blue-700"
                  >
                    {language === "ar" ? "انضم الآن" : "Join Now"}
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            {
              icon: Highlighter,
              title: language === "ar" ? "تظليل مشترك" : "Shared Highlighting",
              color: "text-amber-500",
            },
            {
              icon: MessageSquare,
              title: language === "ar" ? "دردشة فورية" : "Live Chat",
              color: "text-emerald-500",
            },
            {
              icon: Users,
              title: language === "ar" ? "مؤشرات حية" : "Live Cursors",
              color: "text-violet-500",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-card/30 p-6 rounded-[2rem] border border-border/50"
            >
              <div
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm ${feature.color}`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <span className="font-black text-lg">{feature.title}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
