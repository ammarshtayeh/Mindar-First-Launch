import type { Metadata, Viewport } from "next";
import { Cairo, Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppContent } from "@/components/app-content";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import { ReduxProvider } from "@/redux/provider";
import { PWARegistration } from "@/components/pwa-registration";
import { StructuredData } from "@/components/seo/StructuredData";
import { Analytics } from "@/components/analytics";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://mindar.tech"),
  title: {
    default: "MINDAR - حوّل ملفاتك إلى كويزات ذكية | AI-Powered Quiz Generator",
    template: "%s | MINDAR"
  },
  description: "حوّل ملفاتك ومحاضراتك إلى اختبارات ذكية وبطاقات استذكار في ثوانٍ معدودة باستخدام الذكاء الاصطناعي. ارفع PDF أو PPTX وابدأ الدراسة بذكاء. Transform your study materials into smart quizzes and flashcards using AI.",
  keywords: [
    "كويزات ذكية", "ذكاء اصطناعي", "بطاقات تعليمية", "دراسة ذكية", "تطبيق تعليمي",
    "quiz generator", "AI quiz", "flashcards", "study tool", "education", 
    "learning", "AI learning", "smart study", "PDF to quiz", "PPTX to quiz",
    "exam preparation", "test generator", "study assistant", "educational AI"
  ],
  authors: [{ name: "Ammar Shtayeh", url: "https://www.linkedin.com/in/ammar-shtayeh-174259221/" }],
  creator: "Ammar Shtayeh",
  publisher: "MINDAR",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: "/",
    languages: {
      'ar': '/?lang=ar',
      'en': '/?lang=en',
      'x-default': '/'
    }
  },
  
  openGraph: {
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["en_US"],
    url: "/",
    siteName: "MINDAR",
    title: "MINDAR - حوّل ملفاتك إلى كويزات ذكية",
    description: "حوّل ملفاتك ومحاضراتك إلى اختبارات ذكية وبطاقات استذكار في ثوانٍ معدودة باستخدام الذكاء الاصطناعي.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MINDAR - AI-Powered Quiz Generator",
        type: "image/png"
      },
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "MINDAR Logo"
      }
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "MINDAR - AI-Powered Quiz Generator",
    description: "Transform your study materials into smart quizzes and flashcards in seconds using AI.",
    creator: "@mindar_app",
    images: ["/og-image.png"],
  },
  
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/logo.png", type: "image/png", sizes: "48x48" },
      { url: "/logo.png", type: "image/png", sizes: "96x96" }
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: ["/logo.png"],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#6366f1"
      }
    ]
  },
  
  manifest: "/manifest.json",
  
  applicationName: "MINDAR",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MINDAR"
  },
  
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  
  category: "education",
  
  verification: {
    // Add your verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cairo.variable} ${orbitron.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <ThemeProvider>
            <ReduxProvider>
              <I18nProvider>
                <StructuredData type="website" />
                <Analytics />
                <PWARegistration />
                <Navbar />
                <ToastProvider>
                  <AppContent>{children}</AppContent>
                </ToastProvider>
                <Footer />
                <VercelAnalytics />
                <SpeedInsights />
              </I18nProvider>
            </ReduxProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
