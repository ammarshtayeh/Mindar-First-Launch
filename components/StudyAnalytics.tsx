"use client";

import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useI18n } from "@/lib/i18n";

interface StudyAnalyticsProps {
  data: any[];
}

export function StudyAnalytics({ data }: StudyAnalyticsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { language } = useI18n();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsMounted(true);
  }, []);

  const radarData = [
    { subject: "Speed", A: 80, fullMark: 100 },
    { subject: "Accuracy", A: 90, fullMark: 100 },
    { subject: "Consistency", A: 70, fullMark: 100 },
    { subject: "Difficulty", A: 60, fullMark: 100 },
    { subject: "Retention", A: 85, fullMark: 100 },
  ];

  const barData = [
    { name: "Mon", xp: 400 },
    { name: "Tue", xp: 300 },
    { name: "Wed", xp: 600 },
    { name: "Thu", xp: 800 },
    { name: "Fri", xp: 500 },
  ];

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[300px] bg-card/20 animate-pulse rounded-[3rem]" />
        <div className="h-[300px] bg-card/20 animate-pulse rounded-[3rem]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Radar Chart: Skills */}
      <div className="bg-card/50 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-primary/5 shadow-2xl">
        <h3 className="text-2xl font-black mb-8">
          {language === "ar" ? "بوصلة المهارات" : "Smart Skill Radar"}
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid strokeOpacity={0.1} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fontWeight: "bold" }}
              />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Weekly XP */}
      <div className="bg-card/50 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-primary/5 shadow-2xl">
        <h3 className="text-2xl font-black mb-8">
          {language === "ar" ? "تطور الخبرة (XP)" : "Weekly XP Gain"}
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: "bold" }}
              />
              <Tooltip
                cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                contentStyle={{
                  borderRadius: "1rem",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="xp" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 3 ? "#6366f1" : "rgba(99, 102, 241, 0.3)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
