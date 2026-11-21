"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { voiceManager } from "@/lib/voice-manager";
import { useI18n } from "@/lib/i18n";

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md";
  label?: string;
}

/** Free Web Speech — reads the given text when pressed. */
export function SpeakButton({
  text,
  className,
  size = "sm",
  label,
}: SpeakButtonProps) {
  const { language } = useI18n();
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        voiceManager.speak(clean);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shrink-0",
        size === "sm" ? "w-9 h-9" : "w-11 h-11",
        className,
      )}
      title={
        label ||
        (language === "ar" ? "اضغط لتسمع النص" : "Tap to hear this text")
      }
      aria-label={
        label ||
        (language === "ar" ? "اضغط لتسمع النص" : "Tap to hear this text")
      }
    >
      <Volume2 className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
    </button>
  );
}
