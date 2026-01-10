"use client"

import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { FileText, AlertCircle, CheckCircle, XCircle, Scale, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
              <FileText className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
              {isArabic ? 'شروط الخدمة' : 'Terms of Service'}
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
              icon={FileText}
              title={isArabic ? 'مقدمة' : 'Introduction'}
              content={isArabic ? (
                <>
                  <p>
                    مرحباً بك في MINDAR! هذه الشروط والأحكام تحكم استخدامك لمنصتنا التعليمية. 
                    باستخدامك لـ MINDAR، فإنك توافق على الالتزام بهذه الشروط.
                  </p>
                  <p>
                    إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Welcome to MINDAR! These Terms and Conditions govern your use of our educational platform. 
                    By using MINDAR, you agree to comply with these terms.
                  </p>
                  <p>
                    If you disagree with any part of these terms, please do not use our services.
                  </p>
                </>
              )}
            />

            {/* Acceptable Use */}
            <Section 
              icon={CheckCircle}
              title={isArabic ? 'الاستخدام المقبول' : 'Acceptable Use'}
              content={isArabic ? (
                <>
                  <p>يمكنك استخدام MINDAR لـ:</p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>رفع ملفاتك الدراسية الشخصية (PDF, PPTX)</li>
                    <li>توليد كويزات وبطاقات تعليمية</li>
                    <li>تتبع تقدمك الدراسي</li>
                    <li>المشاركة في التحديات والمنافسات</li>
                    <li>استخدام المنصة لأغراض تعليمية شخصية</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>You may use MINDAR to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Upload your personal study materials (PDF, PPTX)</li>
                    <li>Generate quizzes and flashcards</li>
                    <li>Track your study progress</li>
                    <li>Participate in challenges and competitions</li>
                    <li>Use the platform for personal educational purposes</li>
                  </ul>
                </>
              )}
            />

            {/* Prohibited Activities */}
            <Section 
              icon={XCircle}
              title={isArabic ? 'الأنشطة المحظورة' : 'Prohibited Activities'}
              content={isArabic ? (
                <>
                  <p className="text-destructive font-bold">يُحظر عليك:</p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>رفع محتوى محمي بحقوق الطبع والنشر دون إذن</li>
                    <li>مشاركة حسابك مع الآخرين</li>
                    <li>استخدام المنصة لأغراض تجارية دون موافقة</li>
                    <li>محاولة اختراق أو تعطيل المنصة</li>
                    <li>رفع محتوى غير قانوني أو ضار</li>
                    <li>استخدام برامج آلية (bots) للتفاعل مع المنصة</li>
                    <li>إساءة استخدام نظام النقاط أو التلاعب به</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-destructive font-bold">You are prohibited from:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Uploading copyrighted content without permission</li>
                    <li>Sharing your account with others</li>
                    <li>Using the platform for commercial purposes without approval</li>
                    <li>Attempting to hack or disrupt the platform</li>
                    <li>Uploading illegal or harmful content</li>
                    <li>Using automated programs (bots) to interact with the platform</li>
                    <li>Abusing or manipulating the points system</li>
                  </ul>
                </>
              )}
            />

            {/* Intellectual Property */}
            <Section 
              icon={Scale}
              title={isArabic ? 'الملكية الفكرية' : 'Intellectual Property'}
              content={isArabic ? (
                <>
                  <h3 className="font-bold text-xl mt-4">محتوى MINDAR:</h3>
                  <p>
                    جميع المحتويات والتصاميم والشعارات والكود الخاص بـ MINDAR محمية بحقوق الطبع والنشر 
                    ومملوكة لـ Ammar Shtayeh. لا يجوز نسخها أو توزيعها دون إذن كتابي.
                  </p>

                  <h3 className="font-bold text-xl mt-6">محتواك:</h3>
                  <p>
                    أنت تحتفظ بملكية جميع الملفات والمحتوى الذي ترفعه. بتحميلك للمحتوى، فإنك تمنحنا 
                    ترخيصاً محدوداً لمعالجته وتوليد الكويزات والبطاقات التعليمية.
                  </p>
                  <p className="mt-4">
                    نحن لا نطالب بملكية محتواك ولن نشاركه مع أطراف ثالثة دون إذنك.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-xl mt-4">MINDAR Content:</h3>
                  <p>
                    All content, designs, logos, and code of MINDAR are copyrighted and owned by Ammar Shtayeh. 
                    They may not be copied or distributed without written permission.
                  </p>

                  <h3 className="font-bold text-xl mt-6">Your Content:</h3>
                  <p>
                    You retain ownership of all files and content you upload. By uploading content, you grant us 
                    a limited license to process it and generate quizzes and flashcards.
                  </p>
                  <p className="mt-4">
                    We do not claim ownership of your content and will not share it with third parties without your permission.
                  </p>
                </>
              )}
            />

            {/* User Responsibilities */}
            <Section 
              icon={AlertCircle}
              title={isArabic ? 'مسؤوليات المستخدم' : 'User Responsibilities'}
              content={isArabic ? (
                <ul className="list-disc pr-6 space-y-2">
                  <li><strong>أمان الحساب:</strong> أنت مسؤول عن الحفاظ على سرية كلمة المرور</li>
                  <li><strong>دقة المعلومات:</strong> تقديم معلومات صحيحة ودقيقة</li>
                  <li><strong>الاستخدام القانوني:</strong> الالتزام بالقوانين المحلية والدولية</li>
                  <li><strong>المحتوى المرفوع:</strong> التأكد من أن لديك الحق في رفع المحتوى</li>
                  <li><strong>الإبلاغ:</strong> الإبلاغ عن أي نشاط مشبوه أو انتهاكات</li>
                </ul>
              ) : (
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Security:</strong> You are responsible for maintaining password confidentiality</li>
                  <li><strong>Information Accuracy:</strong> Provide accurate and truthful information</li>
                  <li><strong>Legal Use:</strong> Comply with local and international laws</li>
                  <li><strong>Uploaded Content:</strong> Ensure you have the right to upload content</li>
                  <li><strong>Reporting:</strong> Report any suspicious activity or violations</li>
                </ul>
              )}
            />

            {/* Disclaimer */}
            <Section 
              icon={AlertCircle}
              title={isArabic ? 'إخلاء المسؤولية' : 'Disclaimer'}
              content={isArabic ? (
                <>
                  <p>
                    <strong>MINDAR يُقدم "كما هو"</strong> دون أي ضمانات صريحة أو ضمنية. نحن نبذل قصارى جهدنا 
                    لتوفير خدمة موثوقة، ولكن:
                  </p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>لا نضمن دقة المحتوى المُولد بنسبة 100%</li>
                    <li>لا نضمن توفر الخدمة بشكل مستمر دون انقطاع</li>
                    <li>لا نتحمل مسؤولية الأخطاء في الكويزات المُولدة</li>
                    <li>لا نتحمل مسؤولية فقدان البيانات (يُنصح بالنسخ الاحتياطي)</li>
                  </ul>
                  <p className="mt-4 text-sm">
                    استخدامك للمنصة هو على مسؤوليتك الخاصة. نحن لسنا مسؤولين عن أي أضرار مباشرة أو غير مباشرة.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>MINDAR is provided "as is"</strong> without any express or implied warranties. We strive 
                    to provide a reliable service, but:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We do not guarantee 100% accuracy of generated content</li>
                    <li>We do not guarantee uninterrupted service availability</li>
                    <li>We are not responsible for errors in generated quizzes</li>
                    <li>We are not responsible for data loss (backups recommended)</li>
                  </ul>
                  <p className="mt-4 text-sm">
                    Your use of the platform is at your own risk. We are not liable for any direct or indirect damages.
                  </p>
                </>
              )}
            />

            {/* Changes to Terms */}
            <Section 
              icon={RefreshCw}
              title={isArabic ? 'التعديلات على الشروط' : 'Changes to Terms'}
              content={isArabic ? (
                <>
                  <p>
                    نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإخطارك بأي تغييرات جوهرية عبر:
                  </p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>إشعار على المنصة</li>
                    <li>بريد إلكتروني إلى عنوانك المسجل</li>
                    <li>تحديث تاريخ "آخر تحديث" في أعلى الصفحة</li>
                  </ul>
                  <p className="mt-4">
                    استمرارك في استخدام MINDAR بعد التعديلات يعني موافقتك على الشروط الجديدة.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    We reserve the right to modify these terms at any time. We will notify you of any material changes via:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Notice on the platform</li>
                    <li>Email to your registered address</li>
                    <li>Updating the "Last Updated" date at the top of this page</li>
                  </ul>
                  <p className="mt-4">
                    Your continued use of MINDAR after modifications means you accept the new terms.
                  </p>
                </>
              )}
            />

            {/* Termination */}
            <Section 
              icon={XCircle}
              title={isArabic ? 'إنهاء الخدمة' : 'Termination'}
              content={isArabic ? (
                <>
                  <p>يمكننا إنهاء أو تعليق حسابك فوراً في حالة:</p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>انتهاك هذه الشروط</li>
                    <li>نشاط مشبوه أو احتيالي</li>
                    <li>إساءة استخدام المنصة</li>
                    <li>عدم الدفع (للخدمات المدفوعة مستقبلاً)</li>
                  </ul>
                  <p className="mt-4">
                    يمكنك أيضاً حذف حسابك في أي وقت من إعدادات الملف الشخصي.
                  </p>
                </>
              ) : (
                <>
                  <p>We may terminate or suspend your account immediately if:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You violate these terms</li>
                    <li>Suspicious or fraudulent activity</li>
                    <li>Platform abuse</li>
                    <li>Non-payment (for future paid services)</li>
                  </ul>
                  <p className="mt-4">
                    You can also delete your account anytime from profile settings.
                  </p>
                </>
              )}
            />

            {/* Contact */}
            <div className="bg-primary/5 p-6 md:p-8 rounded-2xl">
              <h2 className="text-2xl font-black mb-4">
                {isArabic ? 'تواصل معنا' : 'Contact Us'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isArabic 
                  ? 'إذا كان لديك أي أسئلة حول شروط الخدمة، يرجى التواصل معنا:'
                  : 'If you have any questions about these Terms of Service, please contact us:'}
              </p>
              <div className="space-y-2">
                <p><strong>{isArabic ? 'البريد الإلكتروني:' : 'Email:'}</strong> AMMAR.SHTAYEH@GMAIL.COM</p>
                <p><strong>{isArabic ? 'الهاتف:' : 'Phone:'}</strong> <span dir="ltr">+972 595 537 190</span></p>
                <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/ammar-shtayeh-174259221/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ammar Shtayeh</a></p>
              </div>
            </div>

          </div>

          {/* Footer Links */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              {isArabic ? '← العودة للرئيسية' : '← Back to Home'}
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              {isArabic ? 'سياسة الخصوصية ←' : 'Privacy Policy →'}
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
