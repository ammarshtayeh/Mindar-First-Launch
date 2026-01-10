"use client"

import { Loader2, Brain, Sparkles } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center space-y-8 relative z-10">
        <div className="relative inline-flex items-center justify-center">
          {/* Simplified Loader */}
          <div className="absolute w-28 h-28 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
          
          {/* Central Icon */}
          <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
            <Brain className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-foreground tracking-tighter">
            MINDAR <span className="text-primary italic">AI</span>
          </h2>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-muted-foreground">جاري استدعاء العبقرية...</p>
            <p className="text-sm font-medium opacity-60">Summoning genius...</p>
          </div>
        </div>
        
        {/* Progress Bar Style loader */}
        <div className="w-48 h-1.5 bg-primary/10 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
