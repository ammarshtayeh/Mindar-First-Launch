import { Metadata } from 'next'

interface GenerateMetadataProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  noIndex?: boolean
}

export function generateMetadata({
  title = 'MINDAR - AI-Powered Quiz Generator',
  description = 'Transform your study materials into smart quizzes and flashcards in seconds using AI. Upload PDF or PPTX files and start learning smarter.',
  keywords = 'quiz generator, AI quiz, flashcards, study tool, education, learning, AI learning, smart study, تطبيق كويزات, ذكاء اصطناعي',
  image = '/og-image.png',
  url = '/',
  type = 'website',
  author = 'Ammar Shtayeh',
  publishedTime,
  modifiedTime,
  noIndex = false
}: GenerateMetadataProps = {}): Metadata {
  
  const fullTitle = title.includes('MINDAR') ? title : `${title} | MINDAR`
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindar.tech'
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: author }],
    creator: author,
    publisher: 'MINDAR',
    
    robots: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    
    alternates: {
      canonical: fullUrl,
      languages: {
        'ar': `${fullUrl}?lang=ar`,
        'en': `${fullUrl}?lang=en`,
        'x-default': fullUrl
      }
    },
    
    openGraph: {
      type: type as any,
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: 'MINDAR',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle
        }
      ],
      locale: 'ar_AR',
      alternateLocale: ['en_US'],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime })
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: '@mindar_app'
    },
    
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5
    },
    
    themeColor: '#6366f1',
    
    manifest: '/manifest.json',
    
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png'
    },
    
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'MINDAR'
    },
    
    applicationName: 'MINDAR',
    
    category: 'education'
  }
}

// Helper function for common page metadata
export const commonMetadata = {
  home: () => generateMetadata({
    title: 'MINDAR - حوّل ملفاتك إلى كويزات ذكية',
    description: 'حوّل ملفاتك ومحاضراتك إلى اختبارات ذكية وبطاقات استذكار في ثوانٍ معدودة باستخدام الذكاء الاصطناعي. ارفع PDF أو PPTX وابدأ الدراسة بذكاء.',
    url: '/'
  }),
  
  quiz: () => generateMetadata({
    title: 'الكويز - MINDAR',
    description: 'اختبر معلوماتك مع كويزات ذكية مولدة بالذكاء الاصطناعي. احصل على تحليل فوري لأدائك ونصائح للتحسين.',
    url: '/quiz'
  }),
  
  flashcards: () => generateMetadata({
    title: 'البطاقات التعليمية - MINDAR',
    description: 'راجع المعلومات بسرعة وفعالية مع بطاقات تعليمية تفاعلية مولدة تلقائياً من ملفاتك.',
    url: '/flashcards'
  }),
  
  leaderboard: () => generateMetadata({
    title: 'لوحة المتصدرين - MINDAR',
    description: 'تنافس مع الطلاب الآخرين وشاهد ترتيبك على لوحة المتصدرين. اكسب نقاط XP وارتقِ بمستواك.',
    url: '/leaderboard'
  }),
  
  profile: () => generateMetadata({
    title: 'ملفي الشخصي - MINDAR',
    description: 'تابع تقدمك الدراسي، شاهد إحصائياتك، وإدارة حسابك.',
    url: '/profile',
    noIndex: true
  }),
  
  about: () => generateMetadata({
    title: 'عن MINDAR - قصة المشروع',
    description: 'تعرف على قصة MINDAR وكيف بدأت الفكرة. مشروع تعليمي مبتكر لمساعدة الطلاب على الدراسة بذكاء.',
    url: '/about'
  }),
  
  todo: () => generateMetadata({
    title: 'جدول المذاكرة - MINDAR',
    description: 'نظم وقتك وخطط لدراستك مع جدول مذاكرة ذكي وتذكيرات تلقائية.',
    url: '/todo'
  }),
  
  hub: () => generateMetadata({
    title: 'المركز - MINDAR',
    description: 'ارفع ملفاتك وابدأ رحلة التعلم الذكي. PDF أو PPTX - نحن نحولها إلى تجربة تعليمية تفاعلية.',
    url: '/hub'
  }),
  
  challenge: () => generateMetadata({
    title: 'التحدي - MINDAR',
    description: 'تحدى نفسك والآخرين في اختبارات سريعة ومثيرة. اربح نقاط وأوسمة.',
    url: '/challenge'
  })
}
