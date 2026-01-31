"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // You can log to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 text-destructive mb-4">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-foreground">
              عذراً، حدث خطأ!
            </h1>

            <p className="text-muted-foreground text-lg">
              حدث خطأ غير متوقع. نعمل على إصلاحه في أقرب وقت ممكن.
            </p>

            {typeof process !== "undefined" &&
              process.env?.NODE_ENV === "development" &&
              this.state.error && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-left">
                  <p className="text-sm font-mono text-destructive">
                    {this.state.error.message}
                  </p>
                </div>
              )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="gap-2"
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
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
