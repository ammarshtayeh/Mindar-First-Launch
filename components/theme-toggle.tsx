"use client";

import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon, Focus } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light" as const,
      icon: Sun,
      label: "فاتح",
      color: "text-yellow-500",
    },
    {
      value: "dark" as const,
      icon: Moon,
      label: "داكن",
      color: "text-blue-400",
    },
    {
      value: "focus" as const,
      icon: Focus,
      label: "تركيز",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full p-2 border border-white/10">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.value;

        return (
          <motion.button
            key={t.value}
            onClick={() => setTheme(t.value)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative p-3 rounded-full transition-all duration-300
              ${
                isActive
                  ? "bg-primary text-black shadow-lg"
                  : "hover:bg-white/10 text-white/50"
              }
            `}
            title={t.label}
          >
            <Icon className={`w-5 h-5 ${!isActive && t.color}`} />
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-primary rounded-full -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
