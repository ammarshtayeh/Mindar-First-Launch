import Link from 'next/link'
import { FileQuestion, Home, Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-[150px] md:text-[200px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-primary/20 to-primary/5 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileQuestion className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            الصفحة غير موجودة!
          </h1>
          
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
          </p>
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Link href="/" className="group">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:scale-105">
              <Home className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-foreground">الرئيسية</h3>
              <p className="text-sm text-muted-foreground mt-1">ابدأ من جديد</p>
            </div>
          </Link>
          
          <Link href="/hub" className="group">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:scale-105">
              <Search className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-foreground">المركز</h3>
              <p className="text-sm text-muted-foreground mt-1">ارفع ملفاتك</p>
            </div>
          </Link>
          
          <Link href="/about" className="group">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:scale-105">
              <ArrowRight className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-foreground">عن المشروع</h3>
              <p className="text-sm text-muted-foreground mt-1">تعرف علينا</p>
            </div>
          </Link>
        </div>
        
        {/* CTA Button */}
        <div className="pt-4">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
