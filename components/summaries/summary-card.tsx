"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Image as ImageIcon,
  Download,
  User,
  Calendar,
  ExternalLink,
  Share2,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Summary } from "@/lib/services/dbService";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface SummaryCardProps {
  summary: Summary;
  index: number;
}

export function SummaryCard({ summary, index }: SummaryCardProps) {
  const { t, language } = useI18n();

  const dateObj = summary.createdAt?.toDate
    ? summary.createdAt.toDate()
    : new Date();
  const formattedDate = format(dateObj, "PP", {
    locale: language === "ar" ? ar : enUS,
  });

  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async () => {
    if (cardRef.current === null) return;
    setIsSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0f172a",
      });
      const link = document.createElement("a");
      link.download = `mindar-summary-${summary.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Error generating image");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group h-full border-4 border-transparent hover:border-primary/20 transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl shadow-xl hover:scale-[1.02]">
        <CardContent className="p-8 flex flex-col h-full">
          {/* Icon/Thumbnail Area */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-12 transition-transform duration-500 ${
              summary.fileType === "pdf"
                ? "bg-red-500/20 text-red-500"
                : "bg-blue-500/20 text-blue-500"
            }`}
          >
            {summary.fileType === "pdf" ? (
              <FileText className="w-8 h-8" />
            ) : (
              <ImageIcon className="w-8 h-8" />
            )}
          </div>

          {/* Title & Description */}
          <div className="flex-1 mb-8">
            <h3 className="text-2xl font-black mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {summary.title}
            </h3>
            <p className="text-muted-foreground font-bold line-clamp-3 text-sm leading-relaxed">
              {summary.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-3 mb-8 py-6 border-y border-primary/10">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <User className="w-4 h-4" />
              <span>
                {t("summaries.by")}: {summary.userName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 h-12 rounded-xl font-black gap-2 shadow-lg shadow-primary/20"
              onClick={() => window.open(summary.fileUrl, "_blank")}
            >
              <Download className="w-4 h-4" />
              {t("summaries.download")}
            </Button>
            <Button
              variant="outline"
              className="w-12 h-12 p-0 rounded-xl border-2 border-primary/10"
              onClick={() => window.open(summary.fileUrl, "_blank")}
            >
              <ExternalLink className="w-5 h-5" />
            </Button>
            <Button
              variant="default"
              className="w-12 h-12 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
              onClick={handleShare}
              disabled={isSharing}
              title={t("common.share")}
            >
              {isSharing ? (
                <Sparkles className="w-5 h-5 animate-spin" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Cheat Sheet Template - Saffah Edition */}
      <div style={{ position: "absolute", top: -9999, left: -9999 }}>
        <div
          ref={cardRef}
          className="w-[1080px] h-[1350px] bg-[#0f172a] text-white p-0 flex flex-col relative overflow-hidden font-cairo"
        >
          {/* Abstract Background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

          {/* Header Section */}
          <div className="px-16 pt-16 pb-10 flex items-start justify-between relative z-10">
           <div className="flex items-center gap-6">
             <div className="w-32 h-32 rounded-full overflow-hidden">
  <img
    src="/logo.png"
    alt="Mindar"
    className="w-full h-full object-contain"
  />
</div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-4 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-300 font-bold text-sm tracking-widest uppercase">
                    {summary.fileType === "pdf" ? "Document" : "Image"} Summary
                  </span>
                </div>
                <h1 className="text-5xl font-black leading-tight max-w-2xl line-clamp-2 text-white drop-shadow-lg">
                  {summary.title}
                </h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">
                Generated On
              </p>
              <p className="text-2xl font-black text-white">{formattedDate}</p>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="flex-1 mx-12 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-14 relative z-10 shadow-2xl overflow-hidden">
            {/* Decorative Line */}
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-500" />

            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Lazy Genius Summary
              </h2>
            </div>

            <div className="prose prose-invert prose-2xl max-w-none">
              <p className="text-3xl leading-relaxed font-medium text-slate-200 whitespace-pre-wrap">
                {summary.description || "The summary content goes here..."}
              </p>
            </div>

            {/* Watermark in text */}
            <div className="absolute bottom-8 right-12 opacity-10 pointer-events-none">
              <Share2 className="w-64 h-64 text-white" />
            </div>
          </div>

          {/* Footer with QR */}
          <div className="px-16 py-12 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-8">
              <div className="bg-white p-4 rounded-3xl shadow-xl">
                <QRCodeSVG
                  value={summary.fileUrl || "https://mindar.tech"}
                  size={320}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-2">
                  Scan to Read Full Doc
                </p>
                <div className="flex items-center gap-2 text-indigo-400">
                  <LinkIcon className="w-5 h-5" />
                  <span className="font-bold">Powered by Mindar AI</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                MINDAR
              </p>
              <p className="text-slate-400 font-bold tracking-[0.5em] text-sm mt-2">
                STUDY SMARTER
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
