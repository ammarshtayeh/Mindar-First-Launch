"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUp, Loader2, X, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addSummary } from "@/lib/services/dbService";
import { useToast } from "@/components/ui/toast-provider";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadDialog({
  isOpen,
  onClose,
  onSuccess,
}: UploadDialogProps) {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ type: "error", message: t("summaries.fileRequired") });
      return;
    }
    if (!title.trim()) {
      toast({ type: "error", message: t("summaries.titleRequired") });
      return;
    }
    if (!user) {
      console.error("Upload failed: No authenticated user found.");
      toast({
        type: "error",
        message:
          language === "ar"
            ? "يجب تسجيل الدخول أولاً"
            : "You must be logged in",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log("Starting summary upload for user:", user.uid);
      // 1. Upload to Storage
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `summaries/${user.uid}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          setProgress(percent);
        },
        (error) => {
          console.error("Storage upload failed:", error);
          toast({
            type: "error",
            message:
              language === "ar"
                ? "فشل رفع الملف. تأكد من إعدادات الـ Storage."
                : "Upload failed. Check Storage settings.",
          });
          setUploading(false);
        },
        async () => {
          try {
            // 2. Get URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File uploaded successfully. URL:", downloadURL);

            // 3. Save to Firestore
            await addSummary({
              title,
              description,
              fileUrl: downloadURL,
              fileType: file.type.includes("pdf") ? "pdf" : "image",
              userId: user.uid,
              userName:
                user.displayName || user.email?.split("@")[0] || "Student",
            });

            toast({
              type: "success",
              message: t("summaries.success"),
              description:
                language === "ar"
                  ? "شكراً لمشاركتك يا بطل!"
                  : "Thanks for sharing, hero!",
            });

            setUploading(false);
            reset();
            onSuccess();
          } catch (fsError) {
            console.error("Firestore save failed:", fsError);
            toast({
              type: "error",
              message:
                language === "ar"
                  ? "فشل حفظ البيانات. تأكد من إعدادات الـ Firestore."
                  : "Failed to save data. Check Firestore rules.",
            });
            setUploading(false);
          }
        },
      );
    } catch (error) {
      console.error("Summary upload error:", error);
      toast({ type: "error", message: "Something went wrong" });
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setProgress(0);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !uploading && !open && onClose()}
    >
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black">
            {t("summaries.uploadTitle")}
          </DialogTitle>
          <DialogDescription className="font-bold text-muted-foreground">
            {language === "ar"
              ? "شارك معرفتك مع المجتمع 🚀"
              : "Share your knowledge with the community 🚀"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label className="font-black text-sm uppercase tracking-widest opacity-60 ml-1">
              {t("summaries.fileLabel")}
            </Label>
            <div
              className={`relative h-32 border-4 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group ${
                file
                  ? "border-primary/40 bg-primary/5"
                  : "border-primary/10 hover:border-primary/30"
              }`}
            >
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {file ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                  <span className="font-bold text-sm px-4 truncate max-w-full">
                    {file.name}
                  </span>
                </>
              ) : (
                <>
                  <FileUp className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-black text-xs text-muted-foreground uppercase">
                    {t("upload.dropzone")}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="font-black text-sm uppercase tracking-widest opacity-60 ml-1">
              {t("summaries.titleLabel")}
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                language === "ar"
                  ? "مثلاً: تلخيص فصل الميكانيكا"
                  : "e.g., Mechanics Chapter Summary"
              }
              className="h-12 bg-background/50 rounded-xl font-bold border-2 border-primary/5 focus:border-primary/20 transition-all"
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="font-black text-sm uppercase tracking-widest opacity-60 ml-1">
              {t("summaries.descLabel")}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === "ar"
                  ? "اكتب لمحة سريعة عن المحتوى..."
                  : "Write a quick overview of the content..."
              }
              className="min-h-[100px] bg-background/50 rounded-xl font-bold border-2 border-primary/5 focus:border-primary/20 transition-all resize-none"
              disabled={uploading}
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                <span>{t("summaries.uploading")}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-black"
            disabled={uploading}
          >
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleUpload}
            className="flex-1 h-14 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              t("summaries.uploadBtn")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
