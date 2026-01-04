import { Timeline } from '@/components/about/Timeline';
import { VennDiagram } from '@/components/about/VennDiagram';
import { CoreProcessor } from '@/components/about/CoreProcessor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
        {/* Navigation */}
        <nav className="p-6">
            <Link href="/hub" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                العودة للرئيسية
            </Link>
        </nav>

      {/* Hero Section */}
      <section className="relative py-20 text-center px-4">
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <h1 className="relative text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-500 mb-6 font-primary">
          قصة Mindar
        </h1>
        <p className="relative text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          كيف تحولت الخبرات المتراكمة في الهندسة، القيادة، والريادة إلى منصة ذكية تخدم الجميع.
        </p>
      </section>

      {/* 1. The Journey (Timeline) */}
      <section className="relative">
        <Timeline />
      </section>

      {/* 2. The Intersection (Venn Diagram) */}
      <section className="bg-slate-900/50">
        <VennDiagram />
      </section>

      {/* 3. The Engine (Core Processor) */}
      <section className="relative">
        <CoreProcessor />
      </section>

      {/* Footer / CTA */}
      <section className="py-24 text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-8">هل أنت مستعد لتجربة النتيجة؟</h2>
        <Link 
          href="/hub" 
          className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:-translate-y-1"
        >
          ابدأ رحلتك مع Mindar
        </Link>
      </section>
    </main>
  );
}
