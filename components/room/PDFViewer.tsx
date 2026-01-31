"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Highlighter,
  MessageSquare,
  Type,
  Palette,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  RoomAnnotation,
  RoomCursor,
  updateAnnotation,
  deleteAnnotation,
} from "@/lib/services/roomService";

const PDFJS_VERSION = "3.11.174";

// Standard PDF.js Text Layer CSS
const TEXT_LAYER_CSS = `
  .textLayer {
    position: absolute;
    text-align: initial;
    inset: 0;
    overflow: hidden;
    opacity: 0.2;
    line-height: 1;
    text-wrap: nowrap;
    white-space: pre;
    unicode-bidi: isolate;
  }
  .textLayer span {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }
  .textLayer .highlight {
    margin: -1px;
    padding: 1px;
    background-color: rgba(180, 0, 170, 1);
    border-radius: 4px;
  }
  .textLayer .highlight.appended {
    background-color: rgba(0, 100, 0, 1);
  }
  .textLayer .highlight.selected {
    background-color: rgba(0, 0, 255, 1);
  }
`;

// Using global window.pdfjsLib loaded via CDN to avoid bundler issues
const getPdfJs = async () => {
  if (typeof window === "undefined") return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

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

interface PDFViewerProps {
  pdfUrl: string | null;
  pdfName: string | null;
  language: string;
  annotations: RoomAnnotation[];
  cursors: RoomCursor[];
  onAnnotationAdd: (data: {
    page: number;
    rects: any[];
    color: string;
  }) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleMouseMove: (e: React.MouseEvent) => void;
}

export default function PDFViewer({
  pdfUrl,
  pdfName,
  language,
  annotations,
  cursors,
  onAnnotationAdd,
  onFileUpload,
  isUploading,
  containerRef,
  handleMouseMove,
  roomId,
}: PDFViewerProps & { roomId: string }) {
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [pagesData, setPagesData] = useState<any[]>([]);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5); // Increased for better visibility
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#00bcd4"); // Changed to Cyan for better visibility
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
    null,
  );
  const [noteInput, setNoteInput] = useState("");
  const [showHighlightToast, setShowHighlightToast] = useState(false);

  const currentPageData = pagesData.find((p) => p.pageNumber === currentPage);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: "Cyan", value: "#00bcd4" },
    { name: "Pink", value: "#e91e63" },
    { name: "Orange", value: "#ff9800" },
    { name: "Green", value: "#8bc34a" },
    { name: "Purple", value: "#9c27b0" },
  ];

  // Handle PDF Loading
  useEffect(() => {
    let loadingTask: any = null;
    if (pdfUrl) {
      const loadPdf = async () => {
        try {
          setLoading(true);
          const pdfjs = await getPdfJs();
          setPdfDoc(null);
          setNumPages(0);
          setPagesData([]);

          const response = await fetch(pdfUrl);
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();

          loadingTask = pdfjs.getDocument({
            data: arrayBuffer,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/cmaps/`,
            cMapPacked: true,
          });

          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);

          const pages = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            pages.push({ pageNumber: i, page });
          }
          setPagesData(pages);
          setCurrentPage(1);
          setLoading(false);
        } catch (err: any) {
          console.error("Detailed PDF Loading Error:", err);
          setLoading(false);
        }
      };
      loadPdf();
    }
    return () => {
      if (loadingTask) loadingTask.destroy();
    };
  }, [pdfUrl]);

  const handleMouseUp = (
    pageNumber: number,
    canvas: HTMLCanvasElement | null,
  ) => {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.rangeCount === 0 ||
      selection.isCollapsed ||
      !canvas
    )
      return;

    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects());
    const canvasRect = canvas.getBoundingClientRect();

    const relativeRects = rects
      .map((r) => ({
        x: (r.left - canvasRect.left) / canvasRect.width,
        y: (r.top - canvasRect.top) / canvasRect.height,
        width: r.width / canvasRect.width,
        height: r.height / canvasRect.height,
      }))
      .filter((r) => r.width > 0.001 && r.height > 0.001); // Filter out tiny rects

    if (relativeRects.length === 0) return;

    onAnnotationAdd({
      page: pageNumber,
      rects: relativeRects,
      color: selectedColor,
    });
    selection.removeAllRanges();

    // Show success feedback
    setShowHighlightToast(true);
    setTimeout(() => setShowHighlightToast(false), 2000);
  };

  const PageItem = ({
    pageData,
    scale,
    index,
  }: {
    pageData: any;
    scale: number;
    index: number;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<any>(null);

    useEffect(() => {
      let active = true;
      const render = async () => {
        if (renderTaskRef.current) renderTaskRef.current.cancel();

        const pdfjs = await getPdfJs();
        if (!active || !canvasRef.current) return;

        const { page } = pageData;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport,
        });

        try {
          await renderTaskRef.current.promise;
          if (!active) return;

          if (active && textLayerRef.current) {
            const textContent = await page.getTextContent();
            if (!active || !textLayerRef.current) return;

            textLayerRef.current.innerHTML = "";
            textLayerRef.current.style.setProperty(
              "--scale-factor",
              scale.toString(),
            );
            await pdfjs.renderTextLayer({
              textContent: textContent,
              container: textLayerRef.current,
              viewport,
              textDivs: [],
              enhanceTextSelection: true,
            }).promise;
          }
        } catch (err: any) {
          if (err.name !== "RenderingCancelledException") {
            console.error("PDF Render Error:", err);
          }
        }
      };

      render();
      return () => {
        active = false;
        if (renderTaskRef.current) renderTaskRef.current.cancel();
      };
    }, [pageData, scale]);

    return (
      <div
        ref={(el) => {
          pageRefs.current[index] = el;
        }}
        className="relative shadow-2xl bg-white mb-8 mx-auto h-fit"
        onMouseUp={() => handleMouseUp(pageData.pageNumber, canvasRef.current)}
      >
        <canvas ref={canvasRef} className="block" />
        <div
          ref={textLayerRef}
          className="absolute inset-0 z-10 textLayer pointer-events-auto cursor-text"
        />

        <div className="absolute inset-0 pointer-events-none z-20">
          {annotations
            .filter((a) => a.page === pageData.pageNumber)
            .map((ann, i) => (
              <div
                key={ann.id || i}
                className="absolute inset-0 pointer-events-auto"
              >
                {ann.rects.map((r, ri) => (
                  <div
                    key={ri}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAnnotationId(ann.id || null);
                      setNoteInput(ann.note || "");
                    }}
                    className={cn(
                      "absolute transition-all duration-200 cursor-pointer",
                      activeAnnotationId === ann.id
                        ? "opacity-35 ring-2 ring-primary shadow-lg"
                        : "opacity-25 hover:opacity-35",
                    )}
                    style={{
                      left: `${r.x * 100}%`,
                      top: `${r.y * 100}%`,
                      width: `${r.width * 100}%`,
                      height: `${r.height * 100}%`,
                      backgroundColor: ann.color || "#00bcd4",
                      mixBlendMode: "darken",
                    }}
                  />
                ))}
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex-1 flex flex-col relative overflow-hidden h-full"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <style dangerouslySetInnerHTML={{ __html: TEXT_LAYER_CSS }} />

      {/* Header */}
      <div className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-4">
          <h1 className="font-black text-sm truncate max-w-[200px]">
            {pdfName || (language === "ar" ? "لا يوجد ملف" : "No File")}
          </h1>
          <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    selectedColor === c.value
                      ? "border-primary scale-110 shadow-lg"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Page Navigation */}
          {numPages > 1 && (
            <>
              <Button
                variant="default"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 bg-primary hover:bg-primary/90"
              >
                <ChevronLeft
                  className={`w-4 h-4 text-white ${language === "ar" ? "rotate-180" : ""}`}
                />
              </Button>
              <span className="text-xs font-black min-w-[80px] text-center">
                {currentPage} / {numPages}
              </span>
              <Button
                variant="default"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="w-9 h-9 bg-primary hover:bg-primary/90"
              >
                <ChevronRight
                  className={`w-4 h-4 text-white ${language === "ar" ? "rotate-180" : ""}`}
                />
              </Button>
              <div className="h-6 w-[1px] bg-border mx-2" />
            </>
          )}
          <Button
            variant="default"
            size="icon"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="bg-primary hover:bg-primary/90"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </Button>
          <span className="text-xs font-black min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="default"
            size="icon"
            onClick={() => setScale((s) => Math.min(3, s + 0.1))}
            className="bg-primary hover:bg-primary/90"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </Button>
          <div className="h-6 w-[1px] bg-border mx-2" />
          <input
            type="file"
            id="pdf-upload"
            className="hidden"
            accept=".pdf"
            onChange={onFileUpload}
          />
          <Button
            onClick={() => document.getElementById("pdf-upload")?.click()}
            disabled={isUploading}
            className="gap-2 font-black rounded-xl h-10 px-4"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {pdfUrl
                ? language === "ar"
                  ? "تغيير"
                  : "Change"
                : language === "ar"
                  ? "رفع PDF"
                  : "Upload PDF"}
            </span>
          </Button>
        </div>
      </div>

      {/* Scrolling Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto bg-white p-8 scrollbar-hide relative"
      >
        {!pdfUrl && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
            <div className="w-24 h-24 bg-card rounded-[2rem] border-4 border-primary/20 flex items-center justify-center mb-8 shadow-2xl text-primary animate-bounce">
              <Upload className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black mb-4">
              {language === "ar" ? "ابدأ الدراسة الآن" : "Start Studying Now"}
            </h2>
            <Button
              onClick={() => document.getElementById("pdf-upload")?.click()}
              className="h-16 px-10 rounded-[2rem] font-black text-xl gap-4 shadow-xl"
            >
              <Upload className="w-8 h-8" />
              {language === "ar" ? "ارفع ملف PDF" : "Upload PDF"}
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-black animate-pulse">
              {language === "ar"
                ? "جاري معالجة الصفحات..."
                : "Processing pages..."}
            </p>
          </div>
        )}

        <div className="relative flex items-center justify-center">
          {currentPageData && (
            <>
              <PageItem
                key={currentPage}
                pageData={currentPageData}
                scale={scale}
                index={0}
              />

              {/* Cursors Overlay - Fixed positioning without affecting page */}
              <div className="fixed inset-0 pointer-events-none z-50">
                {cursors.map((c) => (
                  <div
                    key={c.id}
                    className="absolute flex flex-col items-center gap-1 transition-all duration-100"
                    style={{
                      left: `${c.x * 100}%`,
                      top: `${c.y * 100}%`,
                    }}
                  >
                    <MousePointer2 className="w-5 h-5 text-primary fill-primary drop-shadow-lg" />
                    <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xl">
                      {c.userName}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Note Popover / Edit Dialog */}
      <AnimatePresence>
        {activeAnnotationId && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-card border-4 border-primary/30 rounded-[2rem] shadow-2xl overflow-hidden z-[100]"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-black text-sm uppercase">
                    {language === "ar" ? "أضف ملاحظة" : "Add Note"}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={async () => {
                      await deleteAnnotation(roomId, activeAnnotationId);
                      setActiveAnnotationId(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActiveAnnotationId(null)}
                  >
                    <Check className="w-5 h-5 text-green-500" />
                  </Button>
                </div>
              </div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onBlur={async () => {
                  await updateAnnotation(roomId, activeAnnotationId, {
                    note: noteInput,
                  });
                }}
                className="w-full h-24 bg-secondary/50 rounded-2xl p-4 font-bold text-sm outline-none border-2 border-transparent focus:border-primary/20 resize-none"
                placeholder={
                  language === "ar"
                    ? "اكتب شيئاً هنا..."
                    : "Type something here..."
                }
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-card/90 backdrop-blur-2xl border-2 border-primary/20 px-6 py-3 rounded-[2rem] shadow-xl z-30">
        <Highlighter className="w-6 h-6 text-primary" />
        <div className="h-8 w-[2px] bg-border/50" />
        <p className="text-sm font-black opacity-80 uppercase">
          {language === "ar"
            ? "حدد نصاً للتظليل المشترك"
            : "Select text for highlights"}
        </p>
      </div>

      {/* Highlight Success Toast */}
      <AnimatePresence>
        {showHighlightToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-primary text-white px-6 py-3 rounded-[2rem] shadow-2xl flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-black text-sm">
              {language === "ar" ? "تم التظليل بنجاح!" : "Highlight Added!"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
