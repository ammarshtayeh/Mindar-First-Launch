"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  Book,
  Shield,
  Settings,
  Volume2,
  Globe,
  Command as CommandIcon,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getStudyMaterials, StudyMaterial } from "@/lib/services/dbService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleVoice, setLanguage } from "@/redux/slices/settingsSlice";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const { t, language, setLanguage: setI18nLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { voiceEnabled } = useSelector((state: RootState) => state.settings);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      if (user) {
        getStudyMaterials(user.uid).then(setMaterials);
      }
    }
  }, [isOpen, user]);

  const filteredMaterials = materials
    .filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const quickActions = [
    {
      id: "new",
      icon: Zap,
      label: t("command.actions.newQuiz"),
      action: () => router.push("/hub"),
    },
    {
      id: "zen",
      icon: Shield,
      label: t("command.actions.zenMode"),
      action: () => alert("Zen Mode coming soon!"),
    },
    {
      id: "voice",
      icon: Volume2,
      label: t("command.actions.toggleVoice"),
      action: () => dispatch(toggleVoice()),
    },
    {
      id: "lang",
      icon: Globe,
      label: language === "ar" ? "English" : "العربية",
      action: () => {
        const newLang = language === "ar" ? "en" : "ar";
        dispatch(setLanguage(newLang));
        setI18nLanguage(newLang);
      },
    },
  ].filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  const totalItems = quickActions.length + filteredMaterials.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex < quickActions.length) {
        quickActions[selectedIndex].action();
      } else {
        const mat = filteredMaterials[selectedIndex - quickActions.length];
        localStorage.setItem("hub_source_text", mat.extractedText);
        router.push("/hub");
      }
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-3xl border border-white/20 overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-primary/5">
              <Search className="w-6 h-6 text-primary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("command.placeholder")}
                className="flex-1 bg-transparent border-none outline-none text-xl font-bold placeholder:text-muted-foreground/50"
              />
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black opacity-50">
                  ESC
                </kbd>
                <X
                  className="w-5 h-5 cursor-pointer opacity-50 hover:opacity-100"
                  onClick={() => setIsOpen(false)}
                />
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 mb-2">
                    {t("command.sections.actions")}
                  </h5>
                  <div className="space-y-1">
                    {quickActions.map((action, i) => (
                      <div
                        key={action.id}
                        onClick={() => {
                          action.action();
                          setIsOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all",
                          selectedIndex === i
                            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                            : "hover:bg-primary/10",
                        )}
                      >
                        <action.icon className="w-5 h-5" />
                        <span className="font-bold">{action.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {filteredMaterials.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 mb-2">
                    {t("command.sections.materials")}
                  </h5>
                  <div className="space-y-1">
                    {filteredMaterials.map((mat, i) => {
                      const idx = i + quickActions.length;
                      return (
                        <div
                          key={mat.id}
                          onClick={() => {
                            localStorage.setItem(
                              "hub_source_text",
                              mat.extractedText,
                            );
                            router.push("/hub");
                            setIsOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all",
                            selectedIndex === idx
                              ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                              : "hover:bg-primary/10",
                          )}
                        >
                          <Book className="w-5 h-5" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold block truncate">
                              {mat.title}
                            </span>
                            <span
                              className={cn(
                                "text-xs opacity-60 font-bold",
                                selectedIndex === idx
                                  ? "text-white"
                                  : "text-muted-foreground",
                              )}
                            >
                              {mat.tags.length > 0
                                ? mat.tags.join(", ")
                                : t("common.studyChecklist")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {totalItems === 0 && (
                <div className="p-12 text-center text-muted-foreground font-bold italic">
                  {t("command.noResults", { query })}
                </div>
              )}
            </div>

            <div className="p-4 bg-secondary/30 flex justify-between items-center text-[10px] font-black opacity-50 uppercase tracking-tighter">
              <div className="flex gap-4">
                <span className="flex items-center gap-2">
                  <ArrowDown className="w-3 h-3" />{" "}
                  {language === "ar" ? "للتنقل" : "to navigate"}
                </span>
                <span className="flex items-center gap-2">
                  <CornerDownLeft className="w-3 h-3" />{" "}
                  {language === "ar" ? "للاختيار" : "to select"}
                </span>
              </div>
              <span>MINDAR OS v2.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ArrowDown(props: any) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

function CornerDownLeft(props: any) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 10 4 15 9 20" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
  );
}
