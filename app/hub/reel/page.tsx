"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { voiceManager } from "@/lib/voice-manager";
import { getStoredLearningMode } from "@/lib/learning-mode";
import {
  getMaterialMeta,
  getMaterialText,
  getMaterialTitle,
  hashMaterial,
  REEL_CACHE_KEY,
} from "@/lib/material-session";
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
  _sourceHash?: string;
};

export default function EducationalReelPage() {
  const { language } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<ReelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  const loggedRef = useRef(false);
  const lastSpokenRef = useRef<number>(-1);

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
      const text = getMaterialText();
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
        const sourceHash = getMaterialMeta()?.hash || hashMaterial(text);
        const cached = localStorage.getItem(REEL_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as ReelData;
            if (parsed?._sourceHash === sourceHash && parsed?.scenes?.length) {
              setData(parsed);
              setLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem(REEL_CACHE_KEY);
          }
        }

        const res = await fetch("/api/generate-reel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.substring(0, 45000),
            language: language === "ar" ? "ar" : "en",
            mode: getStoredLearningMode(),
            materialTitle: getMaterialTitle(),
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to generate reel");

        const reel = { ...json, _sourceHash: sourceHash };
        localStorage.setItem(REEL_CACHE_KEY, JSON.stringify(reel));
        setData(reel);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    generate();
    return () => voiceManager.stopSpeak();
  }, [language]);

  useEffect(() => {
    if (!data || !user || loggedRef.current) return;
    loggedRef.current = true;
    const name = user.displayName || user.email?.split("@")[0] || "Student";
    logActivity(user.uid, name, "action_started_study").catch(() => {});
  }, [data, user]);

  // Track which stacked scene is in view
  useEffect(() => {
    if (!data?.scenes?.length) return;
    const nodes = sceneRefs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.index);
        if (!Number.isNaN(idx)) setActiveIndex(idx);
      },
      {
        root: scrollerRef.current,
        threshold: [0.55, 0.7, 0.85],
      },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [data]);

  // Auto-narrate active scene while playing
  useEffect(() => {
    if (!playing || !data?.scenes?.[activeIndex]) return;
    if (muted || !voiceManager.isMasterEnabled()) return;
    if (lastSpokenRef.current === activeIndex) return;
    lastSpokenRef.current = activeIndex;
    const scene = data.scenes[activeIndex];
    voiceManager.speak(`${scene.title}. ${scene.narration}`);
  }, [playing, activeIndex, data, muted]);

  const scrollToScene = (idx: number) => {
    sceneRefs.current[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const togglePlay = () => {
    if (!data) return;
    if (playing) {
      setPlaying(false);
      voiceManager.stopSpeak();
    } else {
      lastSpokenRef.current = -1;
      setPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-pink-400" />
        <p className="font-black text-xl animate-pulse">
          {language === "ar"
            ? "جاري تجهيز الريل التعليمي..."
            : "Crafting your educational reel..."}
        </p>
      </div>
    );
  }

  if (error || !data?.scenes?.length) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6 text-white">
        <p className="text-xl font-black text-center max-w-md">
          {error || (language === "ar" ? "لا يوجد ريل" : "No reel")}
        </p>
        <Button
          onClick={() => router.push("/hub")}
          className="rounded-2xl font-black"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "رجوع للـ Hub" : "Back to Hub"}
        </Button>
      </div>
    );
  }

  return (
    <main className="h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
      {/* Sticky top bar */}
      <div className="shrink-0 z-40 pt-20 px-4 pb-3 bg-gradient-to-b from-black via-black/95 to-transparent">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
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
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-2xl bg-white/10 text-white border-white/10"
              onClick={() => {
                setMuted((m) => {
                  const next = !m;
                  if (next) voiceManager.stopSpeak();
                  return next;
                });
              }}
            >
              {muted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="icon"
              className="rounded-2xl bg-white text-black hover:bg-white/90"
              onClick={togglePlay}
            >
              {playing ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="max-w-lg mx-auto mt-2 text-center">
          <h1 className="text-lg font-black truncate">{data.title}</h1>
          <p className="text-[11px] text-white/50 font-bold">
            {activeIndex + 1}/{data.scenes.length} · ~{data.totalDurationSec}s ·{" "}
            {language === "ar" ? "مرّر لتحت" : "Scroll down"}
          </p>
        </div>
      </div>

      {/* Vertical stacked scenes */}
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {data.scenes.map((scene, idx) => (
          <section
            key={scene.id}
            data-index={idx}
            ref={(el) => {
              sceneRefs.current[idx] = el;
            }}
            className="min-h-[calc(100dvh-8rem)] snap-start snap-always px-4 py-4 flex items-stretch"
          >
            <motion.div
              initial={{ opacity: 0.6, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "relative w-full max-w-lg mx-auto rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br flex flex-col justify-end p-6 min-h-[70dvh]",
                gradients[idx % gradients.length],
                activeIndex === idx && "ring-2 ring-white/40",
              )}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative z-10 space-y-4 text-start">
                <div className="text-5xl">{scene.emoji}</div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
                  {language === "ar" ? "مشهد" : "Scene"} {idx + 1}
                </p>
                <h2 className="text-3xl md:text-4xl font-black leading-tight drop-shadow-lg">
                  {scene.title}
                </h2>
                <p className="text-lg md:text-xl font-bold leading-relaxed text-white/95 drop-shadow">
                  {scene.narration}
                </p>
                {idx < data.scenes.length - 1 && (
                  <button
                    type="button"
                    onClick={() => scrollToScene(idx + 1)}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-black text-white/80 hover:text-white"
                  >
                    {language === "ar" ? "المشهد التالي" : "Next scene"}
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                )}
              </div>
            </motion.div>
          </section>
        ))}

        <div className="px-4 pb-16 pt-4 max-w-lg mx-auto text-center space-y-3">
          {data.hook && (
            <p className="text-white/70 font-bold text-sm">{data.hook}</p>
          )}
          <p className="text-xs text-white/40 font-bold">
            {language === "ar"
              ? "المشاهد تحت بعض · مرّر للأسفل · الصوت يقرأ المشهد الظاهر"
              : "Scenes stacked · Scroll down · Voice reads the visible scene"}
          </p>
          <Button
            variant="secondary"
            className="rounded-2xl font-black"
            onClick={() => scrollToScene(0)}
          >
            {language === "ar" ? "ارجع للبداية" : "Back to top"}
          </Button>
        </div>
      </div>
    </main>
  );
}
