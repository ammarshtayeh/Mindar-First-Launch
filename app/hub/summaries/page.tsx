"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  ArrowLeft,
  BookOpen,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { getSummaries, Summary } from "@/lib/services/dbService";
import { useAuth } from "@/hooks/useAuth";
import { SummaryCard } from "@/components/summaries/summary-card";
import { UploadDialog } from "@/components/summaries/upload-dialog";

export default function SummariesPage() {
  const { t, language } = useI18n();
  const router = useRouter();
  const { user } = useAuth();

  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    const data = await getSummaries(50);
    setSummaries(data);
    setLoading(false);
  };

  const filteredSummaries = summaries.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen pt-44 pb-20 px-6 bg-background relative overflow-hidden">
      {/* Abstract Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 gap-2 text-muted-foreground hover:text-foreground font-black"
            >
              <ArrowLeft
                className={`w-4 h-4 ${language === "en" ? "" : "rotate-180"}`}
              />
              {t("common.back")}
            </Button>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              {t("summaries.title")}
            </h1>
            <p className="text-xl text-muted-foreground mt-2 font-bold">
              {t("hub.mulakhasatDesc")}
            </p>
          </div>

          <Button
            onClick={() => setIsUploadOpen(true)}
            size="lg"
            className="h-16 px-8 rounded-2xl gap-3 font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-transform"
          >
            <Plus className="w-6 h-6" />
            <span>{t("summaries.upload")}</span>
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t("summaries.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 pr-4 bg-card/50 backdrop-blur-xl border-2 border-primary/10 rounded-2xl font-bold text-lg focus:border-primary/30 transition-all"
            />
          </div>
          <Button
            variant="outline"
            className="h-14 px-6 rounded-2xl gap-2 font-black border-2 border-primary/20 bg-background hover:bg-primary/5 text-foreground transition-colors"
          >
            <Filter className="w-5 h-5 text-primary" />
            <span>{language === "ar" ? "تصفية" : "Filter"}</span>
          </Button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="font-black text-xl">{t("common.loading")}</p>
          </div>
        ) : filteredSummaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredSummaries.map((summary, idx) => (
                <SummaryCard key={summary.id} summary={summary} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-8">
              <BookOpen className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black mb-2">
              {t("summaries.noSummaries")}
            </h3>
            <p className="text-lg text-muted-foreground font-bold max-w-sm mx-auto">
              {language === "ar"
                ? "كن أول من يشارك مادة تعليمية مع زملائه!"
                : "Be the first to share a study material with your peers!"}
            </p>
          </motion.div>
        )}
      </div>

      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          fetchSummaries();
        }}
      />
    </main>
  );
}
