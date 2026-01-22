"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Info, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getActiveAdsByVariant,
  trackAdClick,
  Ad,
} from "@/lib/services/adsService";

interface AdPlaceholderProps {
  variant?: "banner" | "box" | "sidebar";
  className?: string;
  label?: string;
}

export function AdPlaceholder({
  variant = "banner",
  className,
  label,
}: AdPlaceholderProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isBanner = variant === "banner";
  const isBox = variant === "box";
  const isSidebar = variant === "sidebar";

  useEffect(() => {
    const fetchAds = async () => {
      const fetchedAds = await getActiveAdsByVariant(variant);
      setAds(fetchedAds);
      setCurrentIndex(0); // Reset index when ads change
    };
    fetchAds();
  }, [variant]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const activeAd = ads[currentIndex];

  const handleClick = () => {
    if (activeAd?.id) {
      trackAdClick(activeAd.id);
      window.open(activeAd.link, "_blank");
    }
  };

  // Base classes for the container
  const containerClasses = cn(
    "relative overflow-hidden rounded-[2rem] border border-primary/20 bg-slate-950 shadow-xl",
    isBanner && "w-full h-32 md:h-40",
    isBox && "w-full aspect-square",
    isSidebar && "w-full h-[400px]",
    className,
  );

  // If we have an active ad, show it
  if (activeAd) {
    return (
      <div className={containerClasses}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAd.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 cursor-pointer group"
            onClick={handleClick}
          >
            <img
              src={activeAd.imageUrl}
              alt={activeAd.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 rounded bg-primary text-[8px] font-black uppercase text-white tracking-widest">
                  AD
                </div>
                <h4 className="text-sm md:text-lg font-bold text-white leading-tight">
                  {activeAd.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-primary/80 group-hover:text-primary transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Learn More
                </span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Fallback to placeholder if no ad
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 backdrop-blur-sm group hover:border-primary/40 transition-colors",
        isBanner && "w-full h-32 md:h-40 flex items-center justify-center p-6",
        isBox &&
          "w-full aspect-square flex flex-col items-center justify-center p-8",
        isSidebar &&
          "w-full h-[400px] flex flex-col items-center justify-center p-8",
        className,
      )}
    >
      {/* Simplified background for performance */}
      <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.05] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
          <Sparkles className="w-3 h-3" />
          <span>{label || "Sponsored Content"}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Zap className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors" />
          <h4 className="text-sm font-black text-muted-foreground uppercase tracking-tighter">
            إعلانك هنا {variant.toUpperCase()}
          </h4>
          <p className="text-[10px] text-muted-foreground/60 font-medium italic">
            خلي مشروعك يوصل بين الطلاب
          </p>
        </div>
      </div>

      {/* Info Icon for transparency */}
      <div className="absolute bottom-4 right-6 opacity-20 hover:opacity-100 transition-opacity cursor-help">
        <Info className="w-3 h-3 text-muted-foreground" />
      </div>
    </motion.div>
  );
}
