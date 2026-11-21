"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { voiceManager } from "@/lib/voice-manager";
import { getStoredLearningMode } from "@/lib/learning-mode";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/lib/services/dbService";
import { cn } from "@/lib/utils";

type ReelScene = {
  id: number;
  title: string;
  narration: string;
  durationSec: number;
  emoji: string;
};

type ReelData = {
  title: string;
  hook: string;
  totalDurationSec: number;
  scenes: ReelScene[];
};

export default function EducationalReelPage() {
  const { language } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<ReelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const loggedRef = useRef(false);

  const scene = data?.scenes[index];

  const gradients = useMemo(
    () => [
      "from-rose-600 via-orange-500 to-amber-400",
      "from-violet-700 via-fuchsia-600 to-pink-500",
      "from-cyan-600 via-blue-600 to-indigo-700",
      "from-emerald-600 via-teal-500 to-cyan-400",
      "from-slate-800 via-indigo-800 to-purple-700",
      "from-red-600 via-rose-500 to-orange-400",
    ],
    [],
  );

  useEffect(() => {
    const generate = async () => {
      const text = localStorage.getItem("hub_source_text");
      if (!text) {
        setError(
          language === "ar"
            ? "ارفع مادة أولاً من الـ Hub"
            : "Upload material from the Hub first",
        );
        setLoading(false);
        return;
      }

      try {
        const cached = localStorage.getItem("mindar_last_reel");
        const sourceHash = String(text.length);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?._sourceHash === sourceHash && parsed?.scenes?.length) {
              setData(parsed);
              setLoading(false);
              return;
            }
          } catch {}
        }

        const res = await fetch("/api/generate-reel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.substring(0, 45000),
            language: language === "ar" ? "ar" : "en",
            mode: getStoredLearningMode(),
            materialTitle:
              localStorage.getItem("currentQuiz")
                ? JSON.parse(localStorage.getItem("currentQuiz") || "{}")
                    ?.title || "Study Material"
                : "Study Material",
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to generate reel");

        const reel = { ...json, _sourceHash: sourceHash };
        localStorage.setItem("mindar_last_reel", JSON.stringify(reel));
        setData(reel);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    generate();
    return () => {
      voiceManager.stopSpeak();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [language]);

  useEffect(() => {
    if (!data || !user || loggedRef.current) return;
    loggedRef.current = true;
    const name =
      user.displayName || user.email?.split("@")[0] || "Student";
    logActivity(user.uid, name, "action_started_study").catch(() => {});
  }, [data, user]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const goNext = useCallback(() => {
    if (!data) return;
    if (index >= data.scenes.length - 1) {
      setPlaying(false);
      setProgress(1);
      voiceManager.stopSpeak();
      clearTimer();
      return;
    }
    setIndex((i) => i + 1);
    setProgress(0);
  }, [data, index]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setProgress(0);
  }, []);

  // Speak + progress when scene changes while playing
  useEffect(() => {
    if (!playing || !scene) return;

    clearTimer();
    startedAtRef.current = Date.now();
    setProgress(0);

    if (!muted && voiceManager.isMasterEnabled()) {
      voiceManager.speak(`${scene.title}. ${scene.narration}`);
    }

    const durationMs = Math.max(5000, (scene.durationSec || 8) * 1000);
    timerRef.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAtRef.current) / durationMs);
      setProgress(p);
      if (p >= 1) {
        clearTimer();
        goNext();
      }
    }, 50);

    return () => clearTimer();
  }, [playing, index, scene, muted, goNext]);

  const togglePlay = () => {
    if (!data) return;
    if (playing) {
      setPlaying(false);
      voiceManager.stopSpeak();
      clearTimer();
    } else {
      if (index >= data.scenes.length - 1 && progress >= 1) {
        setIndex(0);
        setProgress(0);
      }
      setPlaying(true);
    }
  };

  const restart = () => {
    voiceManager.stopSpeak();
    clearTimer();
    setIndex(0);
    setProgress(0);
    setPlaying(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-pink-400" />
        <p className="font-black text-xl animate-pulse">
          {language === "ar" ? "جاري تجهيز الريل التعليمي..." : "Crafting your educational reel..."}
        </p>
      </div>
    );
  }

  if (error || !data || !scene) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6 text-white">
        <p className="text-xl font-black text-center max-w-md">
          {error || (language === "ar" ? "لا يوجد ريل" : "No reel")}
        </p>
        <Button onClick={() => router.push("/hub")} className="rounded-2xl font-black">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "رجوع للـ Hub" : "Back to Hub"}
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center pt-24 pb-10 px-4">
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 rounded-2xl font-black"
          onClick={() => {
            voiceManager.stopSpeak();
            router.push("/hub");
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Hub
        </Button>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-pink-300">
          <Sparkles className="w-4 h-4" />
          {language === "ar" ? "ريل تعليمي" : "Edu Reel"}
        </div>
      </div>

      {/* Instagram-like phone frame */}
      <div className="relative w-full max-w-[380px] aspect-[9/16] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">
        {/* Story progress bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1">
          {data.scenes.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white transition-[width] duration-75 ease-linear"
                style={{
                  width:
                    i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0.4, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "absolute inset-0 bg-gradient-to-br flex flex-col justify-end p-6 pb-28",
              gradients[index % gradients.length],
            )}
          >
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative z-10 space-y-4 text-start">
              <div className="text-5xl">{scene.emoji}</div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
                {index + 1}/{data.scenes.length} · ~{data.totalDurationSec}s
              </p>
              <h1 className="text-3xl font-black leading-tight drop-shadow-lg">
                {scene.title}
              </h1>
              <p className="text-lg font-bold leading-relaxed text-white/95 drop-shadow">
                {scene.narration}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tap zones like Instagram */}
        <button
          type="button"
          aria-label="previous"
          className="absolute inset-y-0 left-0 w-1/3 z-20"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        />
        <button
          type="button"
          aria-label="next"
          className="absolute inset-y-0 right-0 w-1/3 z-20"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        />
        <button
          type="button"
          aria-label="play pause"
          className="absolute inset-y-0 left-1/3 right-1/3 z-20"
          onClick={togglePlay}
        />

        {/* Bottom controls */}
        <div className="absolute bottom-4 inset-x-4 z-30 flex items-center justify-between gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-2xl bg-black/40 text-white border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setMuted((m) => {
                const next = !m;
                if (next) voiceManager.stopSpeak();
                return next;
              });
            }}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            size="icon"
            className="rounded-2xl w-14 h-14 bg-white text-black hover:bg-white/90"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-2xl bg-black/40 text-white border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              restart();
            }}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center max-w-md space-y-2">
        <h2 className="text-2xl font-black">{data.title}</h2>
        {data.hook && (
          <p className="text-white/70 font-bold text-sm">{data.hook}</p>
        )}
        <p className="text-xs text-white/40 font-bold">
          {language === "ar"
            ? "تشغيل داخل الموقع فقط · اضغط يمين/يسار للتنقل"
            : "In-app only · Tap left/right to navigate"}
        </p>
      </div>
    </main>
  );
}
