'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const circles = [
  { label: 'القيادة\n(منسق كلية تكنولوجيا المعلومات)', color: 'from-blue-600/60 to-blue-800/60', shadow: 'shadow-blue-500/20', x: -60, y: -60 },
  { label: '(ممثل الجامعة في برنامج التدريبي لاعداد قادة الذكاء الاصطناعي وحرب المعلومات)', color: 'from-purple-600/60 to-purple-800/60', shadow: 'shadow-purple-500/20', x: 60, y: -60 },
  { label: 'الريادة\n(رئيس جمعية الرياديين)', color: 'from-emerald-600/60 to-emerald-800/60', shadow: 'shadow-emerald-500/20', x: -60, y: 60 },
  { label: 'خريج علم حاسوب في سوق العمل', color: 'from-amber-600/60 to-amber-800/60', shadow: 'shadow-amber-500/20', x: 60, y: 60 },
];

export function VennDiagram() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="py-32 relative overflow-hidden" dir="rtl">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-20 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300 mb-6 font-primary">
          نقطة الالتقاء
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto px-4 text-lg font-light leading-relaxed">
          حيث تتناغم الخبرات المختلفة لتخلق <span className="text-blue-400 font-semibold">تأثيراً حقيقياً</span>
        </p>
      </div>

      <div className="h-[600px] flex items-center justify-center relative perspective-1000">
        <div className="relative w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
          {circles.map((circle, index) => {
            const isBlurred = hoveredIndex !== null && hoveredIndex !== index;
            
            return (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ 
                scale: 1, 
                opacity: 1,
                x: circle.x, 
                y: circle.y 
              }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -ml-28 -mt-28 md:-ml-36 md:-mt-36 z-10"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ zIndex: hoveredIndex === index ? 30 : 10 }}
            >
                <motion.div
                  animate={{
                    y: [-10, 10],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    ease: "easeInOut", 
                    delay: index * 1.5 
                  }}
                  className={`w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br ${circle.color} backdrop-blur-sm border border-white/20 flex items-center justify-center text-center p-6 shadow-2xl ${circle.shadow} hover:scale-110 transition-all duration-500 cursor-default ${isBlurred ? 'opacity-30 blur-sm grayscale scale-95' : 'opacity-100 scale-100'}`}
                  style={{ mixBlendMode: 'plus-lighter' }}
                >
                    <div className="relative z-10">
                        <span className="block text-white/90 font-bold text-base md:text-xl whitespace-pre-line drop-shadow-lg leading-tight">
                            {circle.label}
                        </span>
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 blur-[1px]" />
                    </div>
                </motion.div>
            </motion.div>
          )})}

          {/* Central Intersection */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500 ${hoveredIndex !== null ? 'opacity-50 blur-sm scale-90' : 'opacity-100 scale-100'}`}
          >
            <div className="relative group cursor-pointer">
              {/* Pulsing rings */}
              <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full animate-pulse" />
              <div className="absolute inset-[-20px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full group-hover:blur-2xl transition-all duration-500" />
              
              {/* Core Badge */}
              <div className="relative bg-black/40 backdrop-blur-xl text-white px-8 py-4 rounded-full border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:scale-110 transition-transform duration-300">
                <span className="font-bold text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                    MINDAR
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
