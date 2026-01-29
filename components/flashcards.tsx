"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  X,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Flashcard {
  question: string;
  answer: string;
  explanation?: string;
}

interface FlashcardsProps {
  cards: Flashcard[];
  isOpen: boolean;
  onClose: () => void;
  isInline?: boolean;
}

export function Flashcards({
  cards,
  isOpen,
  onClose,
  isInline = false,
}: FlashcardsProps) {
  const { t, language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  if (cards.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="flashcards-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            isInline
              ? "h-[600px] w-full flex flex-col items-center justify-center"
              : "fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6",
          )}
        >
          <div
            className={cn(
              "w-full space-y-8",
              isInline ? "max-w-3xl" : "max-w-4xl",
            )}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <RotateCw className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black">
                    {t("common.flashcards")}
                  </h2>
                  <p className="text-muted-foreground font-bold">
                    {language === "ar"
                      ? `البطاقة ${currentIndex + 1} من ${cards.length}`
                      : `Card ${currentIndex + 1} of ${cards.length}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-14 h-14 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all border-2 border-transparent hover:border-red-500/20"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>

            <div className="relative h-[450px] perspective-1000">
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{
                  duration: 0.6,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="w-full h-full relative preserve-3d cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Side */}
                <Card
                  className={`absolute inset-0 w-full h-full backface-hidden p-6 md:p-12 flex flex-col items-center justify-center text-center rounded-[3.5rem] bg-card border-4 border-primary/20 shadow-2xl overflow-hidden`}
                >
                  <div className="absolute top-6 left-6 text-primary/10">
                    <HelpCircle className="w-20 h-20" />
                  </div>
                  <h3 className="text-4xl font-black leading-tight z-10">
                    {cards[currentIndex].question}
                  </h3>
                  <p className="mt-8 text-primary font-black animate-bounce">
                    {language === "ar"
                      ? "(اضغط عشان تشوف الجواب)"
                      : "(Click to see answer)"}
                  </p>
                </Card>

                {/* Back Side */}
                <Card
                  className={`absolute inset-0 w-full h-full backface-hidden p-6 md:p-12 flex flex-col items-center justify-center text-center rounded-[3.5rem] bg-primary text-primary-foreground shadow-2xl overflow-hidden`}
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <div className="absolute top-6 right-6 text-primary-foreground/10">
                    <CheckCircle2 className="w-20 h-20" />
                  </div>
                  <div className="space-y-6 z-10">
                    <h3 className="text-3xl font-black leading-tight border-b-4 border-black/10 pb-6 mb-6">
                      {cards[currentIndex].answer}
                    </h3>
                    {cards[currentIndex].explanation && (
                      <p className="text-xl font-bold opacity-90 leading-relaxed">
                        {cards[currentIndex].explanation}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="flex justify-center items-center gap-4 sm:gap-8 pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrev}
                className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl sm:rounded-[2.5rem] border-2 sm:border-4 border-primary bg-primary/10 backdrop-blur-md hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-xl text-primary"
              >
                {language === "ar" ? (
                  <ArrowRight className="w-8 h-8 sm:w-12 sm:h-12 stroke-[3]" />
                ) : (
                  <ArrowLeft className="w-8 h-8 sm:w-12 sm:h-12 stroke-[3]" />
                )}
              </Button>

              <div className="flex gap-2 sm:gap-3 px-2 overflow-x-auto no-scrollbar max-w-[150px] sm:max-w-none">
                {cards.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 sm:h-4 rounded-full transition-all duration-500 shrink-0 ${idx === currentIndex ? "w-8 sm:w-12 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "w-2 sm:w-4 bg-primary/10"}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleNext}
                className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl sm:rounded-[2.5rem] border-2 sm:border-4 border-primary bg-primary/10 backdrop-blur-md hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-xl text-primary"
              >
                {language === "ar" ? (
                  <ArrowLeft className="w-8 h-8 sm:w-12 sm:h-12 stroke-[3]" />
                ) : (
                  <ArrowRight className="w-8 h-8 sm:w-12 sm:h-12 stroke-[3]" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* CSS for 3D flip */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </AnimatePresence>
  );
}
