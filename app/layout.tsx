import type { Metadata } from "next";
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
  title:"MINDAR",
  description: "حول ملفاتك إلى اختبارات تفاعلية في ثوانٍ",
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
