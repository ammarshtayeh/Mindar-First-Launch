"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  X,
  Loader2,
  XCircle,
  FileText,
  Zap,
  FileCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackFileUpload } from "@/lib/analytics";
import { saveStudyMaterial } from "@/lib/services/dbService";
import { useAuth } from "@/hooks/useAuth";

interface UploadSectionProps {
  onTextReady: (text: string, title?: string) => void;
  onClear?: () => void;
  isProcessing?: boolean;
}

export function UploadSection({
  onTextReady,
  onClear,
  isProcessing: externalProcessing,
}: UploadSectionProps) {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [processedMaterials, setProcessedMaterials] = useState<string[]>([]);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = externalProcessing || localProcessing;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setError(null);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearProcessed = (material: string) => {
    setProcessedMaterials((prev) => {
      const newState = prev.filter((m) => m !== material);
      if (newState.length === 0 && onClear) {
        // Defer state update to next tick to avoid "Cannot update while rendering" error
        setTimeout(() => onClear(), 0);
      }
      return newState;
    });
  };

  // Helper to load PDF.js from CDN to avoid bundler issues
  const getPdfJs = async () => {
    if (typeof window === "undefined") return null;
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

    const PDFJS_VERSION = "3.11.174";
    const CDNS = [
      `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.js`,
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`,
    ];

    const loadScript = (src: string) =>
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
          const pdfjs = (window as any).pdfjsLib;
          if (pdfjs) {
            pdfjs.GlobalWorkerOptions.workerSrc = src.replace(
              "pdf.min.js",
              "pdf.worker.min.js",
            );
            resolve(pdfjs);
          } else {
            reject(new Error("pdfjsLib not found"));
          }
        };
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(script);
      });

    for (const url of CDNS) {
      try {
        return await loadScript(url);
      } catch (err) {
        console.warn(`Failed to load PDF.js from ${url}, trying next...`);
      }
    }

    throw new Error("Failed to load PDF.js from all CDNs");
  };

  const parseFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += `\n\n### PAGE [${i}] ###\n\n${pageText}\n\n`;
      }
      return fullText;
    } else {
      const formData = new FormData();
      formData.append("file", file);
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });
      if (!parseRes.ok) throw new Error("Server parse failed");
      const resJson = await parseRes.json();
      return resJson.text;
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setLocalProcessing(true);
    setError(null);

    try {
      let combinedText = "";
      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round(((i + 0.5) / files.length) * 100));
        const text = await parseFile(files[i]);
        combinedText += `\n### FILE: ${files[i].name} ###\n${text}`;
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const title = files[0].name.replace(/\.[^/.]+$/, "");

      // Persist to DB if user is logged in
      if (user) {
        await saveStudyMaterial({
          userId: user.uid,
          title,
          extractedText: combinedText,
          folderId: null, // Default to root
          tags: [], // Could implement auto-tagging later
        });
      }

      trackFileUpload(
        files[0].type || files[0].name.split(".").pop() || "unknown",
      );
      onTextReady(combinedText, title);
      setProcessedMaterials((prev) => [...prev, ...files.map((f) => f.name)]);
      setFiles([]);
      setProgress(0);
    } catch (err: any) {
      setError(err.message || "Failed to process files");
    } finally {
      setLocalProcessing(false);
    }
  };

  return (
    <div className="space-y-8 mb-16">
      <Card className="border-4 border-dashed border-primary/20 bg-card/50 backdrop-blur-xl rounded-[3rem] overflow-hidden group">
        <CardContent className="p-12">
          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-6 cursor-pointer py-10 border-2 border-transparent hover:border-primary/20 rounded-[2rem] transition-all bg-primary/5 group-hover:bg-primary/10 ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
              {isProcessing ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <Upload className="w-12 h-12" />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-black mb-2">{t("upload.title")}</h3>
              <p className="text-muted-foreground font-bold">
                {t("upload.dropzone")}
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".pdf,.docx,.pptx,.txt"
              className="hidden"
              disabled={isProcessing}
            />
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 space-y-3"
              >
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-primary w-5 h-5" />
                      <span className="font-bold text-sm truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <span className="text-[10px] opacity-40 font-black">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors"
                      disabled={isProcessing}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full h-16 rounded-2xl text-xl font-black gap-3 mt-4"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Zap className="fill-current w-6 h-6" />
                  )}
                  {t("upload.prepare")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {processedMaterials.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 pt-8 border-t border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="text-green-500 w-5 h-5" />
                  <h4 className="font-black text-sm uppercase text-green-600">
                    {t("upload.readyMaterials")}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {processedMaterials.map((name, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-green-500/5 rounded-2xl border border-green-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-bold text-sm truncate max-w-[150px]">
                          {name}
                        </span>
                      </div>
                      <button
                        onClick={() => clearProcessed(name)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"
                        title={t("common.delete")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 bg-red-500/10 border-2 border-red-500/20 rounded-2xl text-red-500 flex items-center gap-3"
              >
                <XCircle className="w-6 h-6" />
                <p className="font-bold">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {isProcessing && progress > 0 && (
        <div className="mt-4 px-10">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-black opacity-60 uppercase">
              {t("upload.preparing")}
            </span>
            <span className="text-xs font-black text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-primary/10 h-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary glow-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
