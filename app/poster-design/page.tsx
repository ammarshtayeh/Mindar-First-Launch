"use client";
import React from "react";
import Image from "next/image";

export default function PosterDesign() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-10 font-sans">
      {/* 1080x1080 Representative Container */}
      <div className="w-[800px] h-[800px] bg-[#05080f] relative overflow-hidden shadow-[0_0_100px_rgba(156,39,176,0.2)] border border-white/10 rounded-sm">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] -top-20 -left-20 animate-pulse" />
            <div className="absolute w-[500px] h-[500px] bg-cyan-600/30 rounded-full blur-[120px] -bottom-20 -right-20 animate-pulse delay-700" />
          </div>

          {/* Subtle Grid / Neural Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
          {/* Decorative Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] border border-cyan-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

          {/* Logo Section */}
          <div className="relative z-10 mb-12 transform hover:scale-105 transition-transform duration-700">
            <div className="absolute -inset-10 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 blur-3xl opacity-50" />
            {/* Using the user's logo */}
            <div className="w-64 h-64 relative">
              <Image
                src="/uploaded_logo.png" // We will need to make sure this path is accessible or use the absolute path
                alt="Mindar Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Slogan Section */}
          <div className="relative z-10 mt-8 space-y-6">
            <h1
              className="text-5xl md:text-6xl font-black tracking-tighter leading-tight"
              dir="rtl"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
                مندار،
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
                فكرة ورا فكرة بتختار
              </span>
            </h1>

            <div className="flex items-center justify-center gap-4 pt-8">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/20" />
              <span className="text-white/40 uppercase tracking-[0.3em] text-xs font-bold">
                Innovation • AI • Education
              </span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/20" />
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="absolute bottom-12 text-white/20 font-mono text-[10px] tracking-[0.5em] uppercase">
            Designed by Mindar Labs
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @import url("https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap");
        body {
          font-family: "Almarai", sans-serif;
        }
      `}</style>
    </div>
  );
}
