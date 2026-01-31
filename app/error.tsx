"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 text-destructive mb-4 animate-bounce">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-destructive">
          عذراً، حدث خطأ!
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed">
          حدث خطأ غير متوقع أثناء معالجة طلبك. لا تقلق، نحن نعمل على إصلاحه!
        </p>

        {typeof process !== "undefined" &&
          process.env?.NODE_ENV === "development" && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-destructive font-bold">
                <Bug className="w-4 h-4" />
                <span>Development Error Details:</span>
              </div>
              <p className="text-sm font-mono text-destructive break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground">
                  Error Digest: {error.digest}
                </p>
              )}
            </div>
          )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={reset}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4" />
            حاول مرة أخرى
          </Button>

          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          إذا استمرت المشكلة، يرجى{" "}
          <Link href="/about" className="text-primary hover:underline">
            التواصل معنا
          </Link>
        </p>
      </div>
    </div>
  );
}
