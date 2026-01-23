"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Home,
  ClipboardList,
  BookOpen,
  BrainCircuit,
  Swords,
  Star,
  Zap,
  Trophy,
  History,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { GamificationEngine } from "@/lib/gamification";
import { useI18n } from "@/lib/i18n";
import { Languages, Volume2, VolumeX } from "lucide-react";
import { LevelUpOverlay } from "./level-up-overlay";
import { voiceManager } from "@/lib/voice-manager";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleVoice, setLanguage } from "@/redux/slices/settingsSlice";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/services/authService";
import { AuthForm } from "./auth-form";
import { User as UserIcon, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const navItems = [
  { key: "common.home", href: "/", icon: Home },
  { key: "common.quiz", href: "/quiz", icon: BrainCircuit },
  { key: "common.flashcards", href: "/flashcards", icon: BookOpen },
  { key: "common.challenge", href: "/challenge", icon: Swords },
  { key: "common.leaderboard", href: "/leaderboard", icon: Trophy },
  { key: "common.history", href: "/profile/history", icon: History },
  { key: "common.todo", href: "/todo", icon: ClipboardList },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, setLanguage: setI18nLanguage } = useI18n();
  const dispatch = useDispatch();

  // Redux State
  const { level, xp } = useSelector((state: RootState) => state.gamification);
  const { hasData } = useSelector((state: RootState) => state.quiz);
  const { voiceEnabled, language, zenMode } = useSelector(
    (state: RootState) => state.settings,
  );
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      voiceManager.setEnabled(voiceEnabled);
    }
  }, [voiceEnabled, isMounted]);

  const nextLevelXP = Math.pow(level, 2) * 50;
  const currentLevelXP = Math.pow(level - 1, 2) * 50;
  const progress =
    ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const toggleVoiceHandler = () => {
    dispatch(toggleVoice());
  };

  const setLanguageHandler = (lang: "ar" | "en") => {
    dispatch(setLanguage(lang));
    setI18nLanguage(lang);
  };

  if (!isMounted || pathname?.startsWith("/admin") || zenMode) return null;

  return (
    <>
      <LevelUpOverlay />
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-500">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-4">
          {/* Right Section: Auth & Logo (for Desktop) */}
          <div className="flex items-center gap-6">
            {/* User Profile / Auth Button (Desktop: visible at the start) */}
            <div className="hidden lg:block relative">
              {user ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 pr-4 pl-2 h-10 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 focus-visible:ring-0"
                    asChild
                  >
                    <Link href="/profile" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black truncate max-w-[120px] text-slate-900 dark:text-slate-100">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await logout();
                      router.push("/");
                    }}
                    className="w-10 h-10 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all active:scale-95"
                    title="Logout"
                  >
                    <LogOut className="w-6 h-6" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="h-10 px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 text-white font-black shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:scale-[1.05] active:scale-[0.95] transition-all border border-white/20"
                >
                  {t("common.login")}
                </Button>
              )}
            </div>

            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border-2 border-primary/20 overflow-hidden glow-primary relative">
                <img
                  src="/logo-2026.png"
                  alt="Logo"
                  className="w-full h-full object-contain pointer-events-none scale-125"
                  onError={(e) => {
                    (e.target as any).style.display = "none";
                    (e.target as any).nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="hidden absolute inset-0 items-center justify-center bg-gradient-to-tr from-primary to-primary/60 text-white"
                  style={{ display: "none" }}
                >
                  <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary leading-none">
                  {t("home.title")}
                </span>
                <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-primary/60 mt-0.5">
                  MINDAR
                </span>
              </div>
            </Link>

            {isMounted && user && (
              <div className="hidden xl:flex items-center gap-4 bg-primary/5 dark:bg-primary/10 px-4 py-1.5 rounded-2xl border border-primary/10 backdrop-blur-md">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <Star className="text-white w-6 h-6 fill-white" />
                  <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {isMounted ? level : 1}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 w-32">
                  <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      XP {xp}
                    </span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation - Middle */}
          <ul className="hidden lg:flex items-center gap-1 sm:gap-3">
            {navItems
              .filter((item) => {
                if (user) return true;
                // Hide leaderboard and history for guests
                return (
                  item.key !== "common.leaderboard" &&
                  item.key !== "common.history"
                );
              })
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 text-sm sm:text-base font-black",
                        isActive
                          ? "text-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                          : !hasData &&
                              (item.key === "common.quiz" ||
                                item.key === "common.flashcards")
                            ? "text-muted-foreground/30 pointer-events-none"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                      )}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="hidden xl:block">{t(item.key)}</span>

                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 border-2 border-primary/20 rounded-2xl"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>

          {/* Left Section: Controls & Mobile Menu */}
          <div className="flex items-center gap-3">
            {isMounted && user && (
              <div className="md:hidden flex items-center gap-2 bg-yellow-400/20 px-3 py-1.5 rounded-xl border border-yellow-400/30">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-black text-yellow-600">
                  {level}
                </span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoiceHandler}
              className={cn(
                "w-10 h-10 rounded-2xl transition-all active:scale-95 group relative",
                voiceEnabled
                  ? "hover:bg-primary/10 text-primary"
                  : "hover:bg-red-500/10 text-muted-foreground",
              )}
              title={
                voiceEnabled
                  ? t("common.voiceEnabled")
                  : t("common.voiceDisabled")
              }
            >
              {voiceEnabled ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setLanguageHandler(language === "ar" ? "en" : "ar")
              }
              className="w-10 h-10 rounded-2xl hover:bg-primary/10 transition-all active:scale-95"
              title={language === "ar" ? "English" : "العربية"}
            >
              <Languages className="w-6 h-6 text-muted-foreground" />
            </Button>

            <ThemeToggle />

            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <div className="flex items-center gap-2">
                    {!user && (
                      <Button
                        size="sm"
                        onClick={() => setShowAuthModal(true)}
                        className="h-9 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs shadow-lg"
                      >
                        {t("common.login")}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10 h-10 rounded-2xl hover:bg-primary/10 transition-all active:scale-95"
                    >
                      <Menu className="w-6 h-6 text-muted-foreground" />
                    </Button>
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetTitle className="sr-only">
                    {t("common.menu")}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation menu
                  </SheetDescription>
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-black text-foreground mb-2">
                        {t("common.menu")}
                      </h2>
                      {navItems
                        .filter((item) => {
                          if (user) return true;
                          return (
                            item.key !== "common.leaderboard" &&
                            item.key !== "common.history"
                          );
                        })
                        .map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          const isDisabled =
                            !hasData &&
                            (item.key === "common.quiz" ||
                              item.key === "common.flashcards");

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() =>
                                !isDisabled && setMobileMenuOpen(false)
                              }
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold",
                                isActive
                                  ? "text-primary bg-primary/10 shadow-sm"
                                  : isDisabled
                                    ? "text-muted-foreground/30 pointer-events-none"
                                    : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                              )}
                            >
                              <Icon className="w-5 h-5" />
                              <span>{t(item.key)}</span>
                            </Link>
                          );
                        })}
                    </div>

                    {/* User Section in Mobile Menu */}
                    <div className="border-t border-border pt-4 mt-2">
                      {user ? (
                        <>
                          <Link
                            href="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-all"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                              <UserIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-foreground">
                                {user.displayName || user.email?.split("@")[0]}
                              </span>
                              <span className="text-xs text-muted-foreground text-slate-500 dark:text-slate-400">
                                {t("profile.title")}
                              </span>
                            </div>
                          </Link>
                          <Button
                            variant="ghost"
                            onClick={async () => {
                              await logout();
                              router.push("/");
                              setMobileMenuOpen(false);
                            }}
                            className="w-full mt-2 justify-start gap-3 px-4 py-3 h-auto rounded-xl hover:bg-red-500/10 text-red-500"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-bold">Logout</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            setShowAuthModal(true);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 text-white font-black shadow-lg"
                        >
                          {t("common.login")}
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal Overlay */}
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
    </>
  );
}
