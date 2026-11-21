"use client";
import React, { useEffect, useState } from "react";
import GalaxyViewer from "@/components/GalaxyViewer";
import { Loader2, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function GalaxyPage() {
  const { language } = useI18n();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateGalaxy = async () => {
      const text = localStorage.getItem("hub_source_text");
      if (!text) {
        setError(
          language === "ar"
            ? "يرجى رفع مادة أولاً"
            : "Please upload material first",
        );
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/generate-galaxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.substring(0, 50000),
            language: language === "ar" ? "Arabic" : "English",
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            errData.details || errData.error || "Failed to generate galaxy",
          );
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateGalaxy();
  }, [language]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-10">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-blue-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white tracking-widest animate-pulse">
            {language === "ar" ? "جاري بناء المجرة..." : "BUILDING GALAXY..."}
          </h2>
          <p className="text-blue-400 font-bold text-sm uppercase opacity-60">
            AI Knowledge Architect is working
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-white text-center">
          {language === "ar" ? "فشل بناء المجرة" : "Galaxy Blueprint Failed"}
        </h2>
        <p className="text-white/60 font-bold max-w-md text-center">{error}</p>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mt-6 rounded-2xl h-14 px-10 border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          {language === "ar" ? "العودة للرئيسية" : "Back to Hub"}
        </Button>
      </div>
    );
  }

  return <GalaxyViewer data={data} />;
}
