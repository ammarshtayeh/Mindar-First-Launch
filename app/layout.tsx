import type { Metadata, Viewport } from "next";
import { Cairo, Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppContent } from "@/components/app-content";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import { ReduxProvider } from "@/redux/provider";

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
  metadataBase: new URL("https://mindar.tech"),
  title: "Mindar | رفيقك الذكي للدراسة",
  description: "حول مادتك الدراسية (PDF/PPTX) إلى كويزات، بطاقات تعليمية، ومهام ذكية في ثوانٍ باستخدام الذكاء الاصطناعي.",
  keywords: ["دراسة", "ذكاء اصطناعي", "كويزات", "بطاقات تعليمية", "مهام", "Mindar", "AI Study", "Quiz Generator"],
  authors: [{ name: "Mindar Team" }],
  openGraph: {
    title: "Mindar | رفيقك الذكي للدراسة",
    description: "توقف عن الدراسة التقليدية! ارفع ملفاتك ودع الذكاء الاصطناعي يقوم بالباقي.",
    url: "https://mindar.tech",
    siteName: "Mindar AI",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Mindar AI Logo",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindar | AI Study Companion",
    description: "Generate quizzes and flashcards from your study materials in seconds.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
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
        <ThemeProvider>
          <ReduxProvider>
            <I18nProvider>
              <Navbar />
              <AppContent>{children}</AppContent>
              <Footer />
            </I18nProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
