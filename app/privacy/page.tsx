"use client"

import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Cookie, UserCheck, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  const { t, language } = useI18n()
  const isArabic = language === 'ar'

  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-4">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
              {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isArabic 
                ? 'آخر تحديث: 10 يناير 2026' 
                : 'Last Updated: January 10, 2026'}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            
            {/* Introduction */}
            <Section 
              icon={Eye}
              title={isArabic ? 'مقدمة' : 'Introduction'}
              content={isArabic ? (
                <>
                  <p>
                    مرحباً بك في MINDAR! نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. 
                    توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام منصتنا.
                  </p>
                  <p>
                    باستخدامك لـ MINDAR، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Welcome to MINDAR! We respect your privacy and are committed to protecting your personal data. 
                    This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                  </p>
                  <p>
                    By using MINDAR, you agree to the collection and use of information in accordance with this policy.
                  </p>
                </>
              )}
            />

            {/* Data Collection */}
            <Section 
              icon={UserCheck}
              title={isArabic ? 'البيانات التي نجمعها' : 'Information We Collect'}
              content={isArabic ? (
                <>
                  <h3 className="font-bold text-xl mt-4">1. المعلومات التي تقدمها مباشرة:</h3>
                  <ul className="list-disc pr-6 space-y-2">
                    <li><strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، كلمة المرور (مشفرة)</li>
                    <li><strong>المحتوى الدراسي:</strong> الملفات التي ترفعها (PDF, PPTX)</li>
                    <li><strong>بيانات الاستخدام:</strong> نتائج الكويزات، التقدم الدراسي، الإحصائيات</li>
                  </ul>

                  <h3 className="font-bold text-xl mt-6">2. المعلومات التي نجمعها تلقائياً:</h3>
                  <ul className="list-disc pr-6 space-y-2">
                    <li><strong>معلومات الجهاز:</strong> نوع المتصفح، نظام التشغيل، عنوان IP</li>
                    <li><strong>بيانات الاستخدام:</strong> الصفحات التي تزورها، الوقت المستغرق، التفاعلات</li>
                    <li><strong>ملفات تعريف الارتباط (Cookies):</strong> لتحسين تجربتك وحفظ تفضيلاتك</li>
                  </ul>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-xl mt-4">1. Information You Provide:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Information:</strong> Name, email, password (encrypted)</li>
                    <li><strong>Study Content:</strong> Files you upload (PDF, PPTX)</li>
                    <li><strong>Usage Data:</strong> Quiz results, study progress, statistics</li>
                  </ul>

                  <h3 className="font-bold text-xl mt-6">2. Information We Collect Automatically:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                    <li><strong>Usage Data:</strong> Pages visited, time spent, interactions</li>
                    <li><strong>Cookies:</strong> To improve your experience and save preferences</li>
                  </ul>
                </>
              )}
            />

            {/* Data Usage */}
            <Section 
              icon={Lock}
              title={isArabic ? 'كيف نستخدم بياناتك' : 'How We Use Your Data'}
              content={isArabic ? (
                <ul className="list-disc pr-6 space-y-2">
                  <li>توفير وتحسين خدماتنا التعليمية</li>
                  <li>توليد كويزات وبطاقات تعليمية مخصصة</li>
                  <li>تتبع تقدمك الدراسي وتقديم توصيات</li>
                  <li>التواصل معك بشأن حسابك والتحديثات</li>
                  <li>تحليل استخدام المنصة لتحسين الأداء</li>
                  <li>حماية المنصة من الاستخدام غير المشروع</li>
                </ul>
              ) : (
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our educational services</li>
                  <li>Generate personalized quizzes and flashcards</li>
                  <li>Track your study progress and provide recommendations</li>
                  <li>Communicate with you about your account and updates</li>
                  <li>Analyze platform usage to improve performance</li>
                  <li>Protect the platform from unauthorized use</li>
                </ul>
              )}
            />

            {/* Data Protection */}
            <Section 
              icon={Shield}
              title={isArabic ? 'حماية بياناتك' : 'Data Protection'}
              content={isArabic ? (
                <>
                  <p>نتخذ إجراءات أمنية صارمة لحماية بياناتك:</p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li><strong>التشفير:</strong> جميع البيانات الحساسة مشفرة (SSL/TLS)</li>
                    <li><strong>Firebase Security:</strong> نستخدم Firebase لتخزين آمن ومعتمد</li>
                    <li><strong>الوصول المحدود:</strong> فقط الموظفون المصرح لهم يمكنهم الوصول للبيانات</li>
                    <li><strong>النسخ الاحتياطي:</strong> نسخ احتياطية منتظمة لحماية بياناتك</li>
                    <li><strong>المراقبة:</strong> مراقبة مستمرة للأنشطة المشبوهة</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>We implement strict security measures to protect your data:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Encryption:</strong> All sensitive data is encrypted (SSL/TLS)</li>
                    <li><strong>Firebase Security:</strong> We use Firebase for secure, certified storage</li>
                    <li><strong>Limited Access:</strong> Only authorized personnel can access data</li>
                    <li><strong>Backups:</strong> Regular backups to protect your data</li>
                    <li><strong>Monitoring:</strong> Continuous monitoring for suspicious activities</li>
                  </ul>
                </>
              )}
            />

            {/* Cookies */}
            <Section 
              icon={Cookie}
              title={isArabic ? 'ملفات تعريف الارتباط (Cookies)' : 'Cookies'}
              content={isArabic ? (
                <>
                  <p>نستخدم ملفات تعريف الارتباط لـ:</p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>حفظ تفضيلاتك (اللغة، الثيم)</li>
                    <li>تذكر تسجيل دخولك</li>
                    <li>تحليل استخدام الموقع</li>
                    <li>تحسين تجربة المستخدم</li>
                  </ul>
                  <p className="mt-4">
                    يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.
                  </p>
                </>
              ) : (
                <>
                  <p>We use cookies to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Save your preferences (language, theme)</li>
                    <li>Remember your login</li>
                    <li>Analyze site usage</li>
                    <li>Improve user experience</li>
                  </ul>
                  <p className="mt-4">
                    You can control cookies through your browser settings.
                  </p>
                </>
              )}
            />

            {/* Your Rights */}
            <Section 
              icon={UserCheck}
              title={isArabic ? 'حقوقك' : 'Your Rights'}
              content={isArabic ? (
                <ul className="list-disc pr-6 space-y-2">
                  <li><strong>الوصول:</strong> يمكنك طلب نسخة من بياناتك الشخصية</li>
                  <li><strong>التصحيح:</strong> يمكنك تحديث أو تصحيح معلوماتك</li>
                  <li><strong>الحذف:</strong> يمكنك طلب حذف حسابك وبياناتك</li>
                  <li><strong>الاعتراض:</strong> يمكنك الاعتراض على معالجة بياناتك</li>
                  <li><strong>النقل:</strong> يمكنك طلب نقل بياناتك إلى خدمة أخرى</li>
                </ul>
              ) : (
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct your information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Objection:</strong> Object to processing of your data</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                </ul>
              )}
            />

            {/* Contact */}
            <Section 
              icon={Mail}
              title={isArabic ? 'تواصل معنا' : 'Contact Us'}
              content={isArabic ? (
                <>
                  <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا:</p>
                  <div className="bg-primary/5 p-6 rounded-2xl mt-4 space-y-2">
                    <p><strong>البريد الإلكتروني:</strong> privacy@mindar.app</p>
                    <p><strong>الهاتف:</strong> <span dir="ltr">+972 595 537 190</span></p>
                    <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/ammar-shtayeh-174259221/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ammar Shtayeh</a></p>
                  </div>
                </>
              ) : (
                <>
                  <p>If you have any questions about this Privacy Policy, please contact us:</p>
                  <div className="bg-primary/5 p-6 rounded-2xl mt-4 space-y-2">
                    <p><strong>Email:</strong> privacy@mindar.app</p>
                    <p><strong>Phone:</strong> +972 595 537 190</p>
                    <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/ammar-shtayeh-174259221/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ammar Shtayeh</a></p>
                  </div>
                </>
              )}
            />

          </div>

          {/* Footer Links */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              {isArabic ? '← العودة للرئيسية' : '← Back to Home'}
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              {isArabic ? 'شروط الخدمة ←' : 'Terms of Service →'}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function Section({ icon: Icon, title, content }: { icon: any, title: string, content: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-foreground">{title}</h2>
      </div>
      <div className="text-muted-foreground leading-relaxed">
        {content}
      </div>
    </div>
  )
}
