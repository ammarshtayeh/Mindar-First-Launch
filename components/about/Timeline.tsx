'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, Cpu, Lightbulb } from 'lucide-react';

const steps = [
  {
    icon: BookOpen,
    title: 'علم الحاسوب في سوق العمل(هندسة برمجيات)',
    description: 'التخصص الأساسي والتخرج منه.',
    date: 'البداية',
    color: 'bg-blue-500',
  },
  {
    icon: Users,
    title: 'منسق  الكلية',
    description: 'صوت الطلاب وتفهم احتياجات المجتمع الأكاديمي.',
    date: 'القيادة',
    color: 'bg-green-500',
  },
  {
    icon: Cpu,
    title: 'ممثل جامعة النجاح في البرنامج التدريبي لاعداد قادة الذكاء الاصطناعي وحرب المعلومات',
    description: 'شغف بالمستقبل وإيمان بقدرة الـ AI على التغيير.',
    date: 'الابتكار',
    color: 'bg-purple-500',
  },
  {
    icon: Lightbulb,
    title: 'رئيس جمعية الرياديين',
    description: 'تحويل الأفكار إلى واقع ومشاريع ملموسة.',
    date: 'الريادة',
    color: 'bg-yellow-500',
  },
];

export function Timeline() {
  return (
    <div className="py-20 relative px-4" dir="rtl">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        رحلة بناء المؤسس
      </h2>
      
      <div className="max-w-4xl mx-auto relative">
        {/* Center Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-slate-700/50 rounded-full" />

        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={`relative flex items-center justify-between mb-12 last:mb-0 w-full ${
              index % 2 === 0 ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Content Side */}
            <div className="w-[45%]">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-slate-500 transition-colors shadow-lg group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-${step.color}/20 text-white`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{step.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
                <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 bg-white/5 rounded-full text-slate-400 border border-white/10">
                  {step.date}
                </span>
              </div>
            </div>

            {/* Center Dot */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <div className={`w-4 h-4 ${step.color} rounded-full z-10 ring-4 ring-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
            </div>

            {/* Empty Side for Spacing */}
            <div className="w-[45%]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
