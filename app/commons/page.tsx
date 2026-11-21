"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowLeft,
  BookOpen,
  Loader2,
  Filter,
  Globe,
  Download,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { getPublicMaterials, StudyMaterial } from "@/lib/services/dbService";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { setMaterialSession } from "@/lib/material-session";

export default function CommonsPage() {
  const { t, language } = useI18n();
  const router = useRouter();
  const { toast } = useToast();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMaterials = async () => {
    setLoading(true);
    const data = await getPublicMaterials(50);
    setMaterials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleClone = (material: StudyMaterial) => {
    setMaterialSession(material.extractedText, {
      title: material.title,
      source: "commons",
      clearDerived: true,
    });
    toast({
      type: "success",
      message:
        language === "ar"
          ? "تم استيراد المادة بنجاح! 🚀"
          : "Material imported successfully! 🚀",
      description:
        language === "ar"
          ? "يمكنك الآن بدء الدراسة في الـ Hub."
          : "You can now start studying in the Hub.",
    });
    router.push("/hub");
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen pt-44 pb-20 px-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/hub")}
              className="mb-4 gap-2 text-muted-foreground hover:text-foreground font-black"
            >
              <ArrowLeft
                className={`w-4 h-4 ${language === "en" ? "" : "rotate-180"}`}
              />
              {t("common.back")}
            </Button>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter flex items-center gap-4">
              <Globe className="text-emerald-500 w-16 h-16" />
              {t("hub.commons")}
            </h1>
            <p className="text-xl text-muted-foreground mt-4 font-bold max-w-2xl">
              {t("hub.commonsDesc")}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder={
                language === "ar"
                  ? "ابحث عن مواد دراسية..."
                  : "Search for study materials..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-20 pl-16 pr-8 bg-card/40 backdrop-blur-3xl border-4 border-emerald-500/10 rounded-3xl font-black text-2xl focus:border-emerald-500/30 transition-all shadow-2xl"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mb-6" />
            <p className="font-black text-2xl animate-pulse">
              {t("common.loading")}
            </p>
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredMaterials.map((material, idx) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="h-full border-4 border-transparent hover:border-emerald-500/20 transition-all duration-500 rounded-[3rem] overflow-hidden bg-card/40 backdrop-blur-xl shadow-2xl group cursor-default">
                    <CardContent className="p-10 flex flex-col h-full gap-6">
                      <div className="flex items-start justify-between">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-black">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Public</span>
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        <h3 className="text-3xl font-black leading-tight group-hover:text-emerald-500 transition-colors line-clamp-2">
                          {material.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground font-bold">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            Added by {material.userName || "StudyMate"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border/50 flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest font-black opacity-40">
                            Category
                          </span>
                          <span className="text-xs font-bold">
                            {material.category || "General"}
                          </span>
                        </div>
                        <Button
                          onClick={() => handleClone(material)}
                          className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black gap-2 shadow-lg hover:scale-105 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>
                            {language === "ar" ? "استيراد" : "Import"}
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-40">
            <Globe className="w-32 h-32 text-muted-foreground/20 mx-auto mb-10" />
            <h3 className="text-4xl font-black text-muted-foreground/40 italic">
              {language === "ar"
                ? "لا يوجد مواد عامة بعد"
                : "No public materials found"}
            </h3>
          </div>
        )}
      </div>
    </main>
  );
}
