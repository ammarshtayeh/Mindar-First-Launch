"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Send, ArrowLeft, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import {
  subscribeToRoom,
  subscribeToAnnotations,
  subscribeToChat,
  subscribeToCursors,
  updateRoomPdf,
  addAnnotation,
  sendChatMessage,
  updateCursor,
  StudyRoom,
  RoomAnnotation,
  RoomChatMessage,
  RoomCursor,
} from "@/lib/services/roomService";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/components/ui/toast-provider";
import dynamic from "next/dynamic";

// Dynamically import PDFViewer (client-only)
const PDFViewer = dynamic(() => import("@/components/room/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-200 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-black text-muted-foreground animate-pulse">
          تحميل بيئة الدراسة...
        </p>
      </div>
    </div>
  ),
});

export default function RoomDetailsPage() {
  const { id: roomId } = useParams() as { id: string };
  const { t, language } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [annotations, setAnnotations] = useState<RoomAnnotation[]>([]);
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [cursors, setCursors] = useState<RoomCursor[]>([]);
  const [loading, setLoading] = useState(true);

  const [chatInput, setChatInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to everything
  useEffect(() => {
    if (!roomId) return;

    const unsubRoom = subscribeToRoom(roomId, (data) => {
      setRoom(data);
      setLoading(false);
    });

    const unsubAnns = subscribeToAnnotations(roomId, (data) => {
      setAnnotations(data);
    });

    const unsubChat = subscribeToChat(roomId, (data) => {
      setMessages(data);
    });

    const unsubCursors = subscribeToCursors(roomId, (data) => {
      setCursors(data.filter((c) => c.id !== user?.uid)); // Don't show own cursor
    });

    return () => {
      unsubRoom();
      unsubAnns();
      unsubChat();
      unsubCursors();
    };
  }, [roomId, user?.uid]);

  // Handle PDF Loading is now handled by PDFViewer
  // Handle Page Rendering is now handled by PDFViewer

  // Cursor Tracking (Throttled)
  const lastCursorUpdate = useRef<number>(0);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!user || !containerRef.current) return;

    const now = Date.now();
    if (now - lastCursorUpdate.current < 100) return; // Throttle to 100ms
    lastCursorUpdate.current = now;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    updateCursor(roomId, {
      id: user.uid,
      x,
      y,
      userName: user.displayName || "User",
    });
  };

  // handleMouseUp is now handled by PDFViewer

  const handleSendMessage = () => {
    if (!chatInput.trim() || !user) return;
    sendChatMessage(roomId, {
      userId: user.uid,
      userName: user.displayName || "User",
      message: chatInput,
    });
    setChatInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `rooms/${roomId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateRoomPdf(roomId, url, file.name);
      toast({
        type: "success",
        message: language === "ar" ? "تم رفع الملف بنجاح" : "PDF Uploaded",
      });
    } catch (err: any) {
      toast({
        type: "error",
        message: language === "ar" ? "فشل رفع الملف" : "Upload Failed",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddAnnotation = (data: {
    page: number;
    rects: any[];
    color: string;
  }) => {
    if (!user || !room) return;

    addAnnotation(roomId, {
      userId: user.uid,
      userName: user.displayName || "User",
      type: "highlight",
      page: data.page,
      rects: data.rects,
      color: data.color || "#ffeb3b",
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return null;
  if (!room) return <div>Room not found</div>;

  return (
    <div
      className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Sidebar - Chat & Participants */}
      <div className="w-80 border-l border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <Button
            variant="secondary"
            onClick={() => router.push("/rooms")}
            className="mb-4 gap-2 font-black px-4 bg-primary/20 hover:bg-primary/30 text-primary border-none rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center"
          >
            <ArrowLeft
              className={`w-4 h-4 ${language === "ar" ? "rotate-180" : ""}`}
            />
            {t("common.back")}
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-black text-lg line-clamp-1">{room.name}</h2>
              <p className="text-xs text-muted-foreground font-bold">
                ID: {room.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
              {language === "ar" ? "المشاركون" : "Participants"}
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black border border-primary/20">
                {user?.displayName || "You"}
              </div>
              {cursors.map((c) => (
                <div
                  key={c.id}
                  className="px-3 py-1 bg-secondary rounded-full text-xs font-black"
                >
                  {c.userName}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
              {language === "ar" ? "الدردشة" : "Chat"}
            </h3>
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.userId === user?.uid ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] font-black opacity-50 mb-1">
                    {m.userName}
                  </span>
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl text-sm font-medium max-w-[90%]",
                      m.userId === user?.uid
                        ? "bg-primary text-white"
                        : "bg-secondary text-foreground",
                    )}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="relative flex items-center">
            <Input
              placeholder={
                language === "ar" ? "اكتب رسالة..." : "Type a message..."
              }
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="pr-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-border font-bold"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-3 text-primary hover:scale-110 transition-transform p-1"
            >
              <Send
                className={`w-5 h-5 ${language === "ar" ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <PDFViewer
        pdfUrl={room.pdfUrl || null}
        pdfName={room.pdfName || null}
        language={language}
        annotations={annotations}
        cursors={cursors}
        onAnnotationAdd={handleAddAnnotation}
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        containerRef={containerRef}
        handleMouseMove={handleMouseMove}
        roomId={roomId}
      />
    </div>
  );
}
