'use client';

import { motion } from 'framer-motion';

export function CoreProcessor() {
  return (
    <div className="py-24 relative" dir="rtl">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-20 text-white">المعالج المركزي</h2>
      
      <div className="flex justify-center items-center relative h-[400px]">
        {/* Central Core */}
        <div className="relative z-10 w-32 h-32 md:w-48 md:h-48">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-dashed border-purple-500/30"
          />
          <div className="absolute inset-4 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.15)]">
            <div className="text-center">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 pb-1">
                Mindar
              </div>
              <div className="text-[10px] text-slate-500 tracking-widest uppercase">Core System</div>
            </div>
          </div>
        </div>

        {/* Feeding Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
             <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="grad4" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Top Left - Engineering */}
          <DataStream start={{ x: '10%', y: '10%' }} end={{ x: '50%', y: '50%' }} color="url(#grad1)" delay={0} />
          
          {/* Top Right - AI */}
          <DataStream start={{ x: '90%', y: '10%' }} end={{ x: '50%', y: '50%' }} color="url(#grad2)" delay={0.5} />
          
          {/* Bottom Left - Leadership */}
          <DataStream start={{ x: '10%', y: '90%' }} end={{ x: '50%', y: '50%' }} color="url(#grad3)" delay={1} />
          
          {/* Bottom Right - Entrepreneurship */}
          <DataStream start={{ x: '90%', y: '90%' }} end={{ x: '50%', y: '50%' }} color="url(#grad4)" delay={1.5} />
        </svg>

        {/* Labels */}
        <Label x="10%" y="10%" text="علم حاسوب في سوق العمل" color="text-blue-400" align="left" />
        <Label x="90%" y="10%" text="قادة الـ AI" color="text-purple-400" align="right" />
        <Label x="10%" y="90%" text="ممثل الكلية" color="text-green-400" align="left" />
        <Label x="90%" y="90%" text="الريادة" color="text-yellow-400" align="right" />
      </div>
    </div>
  );
}

function DataStream({ start, end, color, delay }: { start: { x: string, y: string }, end: { x: string, y: string }, color: string, delay: number }) {
  return (
    <>
      <line 
        x1={start.x} y1={start.y} 
        x2={end.x} y2={end.y} 
        stroke={color} 
        strokeWidth="2" 
        strokeOpacity="0.3"
      />
      <motion.circle
        r="3"
        fill="white"
        initial={{ cx: start.x, cy: start.y, opacity: 0 }}
        animate={{ 
          cx: [start.x, end.x], 
          cy: [start.y, end.y],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "linear", 
          delay: delay,
          repeatDelay: 0.5
        }}
      />
    </>
  );
}



function Label({ x, y, text, color, align }: { x: string, y: string, text: string, color: string, align: 'left' | 'right' }) {
    return (
        <div 
            className={`absolute font-bold text-lg ${color} ${align === 'right' ? 'text-right' : 'text-left'}`}
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
        >
            {text}
        </div>
    )
}
