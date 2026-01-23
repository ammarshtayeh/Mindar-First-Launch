"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { arEG, enUS } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DateTimePicker } from "@/components/date-time-picker";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import {
  addTask,
  subscribeToTasks,
  updateTaskStatus,
  deleteTask,
  TodoTask,
} from "@/lib/services/todoService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TodoPage() {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const isAr = language === "ar";
  const dateLocale = isAr ? arEG : enUS;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTasks(user.uid, (data) => {
      const sortedData = [...data].sort(
        (a, b) => (a.position || 0) - (b.position || 0),
      );
      setTasks(sortedData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAdd = async () => {
    if (!title.trim() || !user) return;

    setIsSaving(true);
    try {
      await addTask(
        user.uid,
        user.email || "",
        title,
        date || null,
        priority,
        desc,
      );
      setIsAddOpen(false);
      setTitle("");
      setDesc("");
      setDate(undefined);
      setPriority("medium");
    } catch (error) {
      console.error(error);
      alert(isAr ? "حدث خطأ أثناء حفظ المهمة" : "Error saving task");
    } finally {
      setIsSaving(false);
    }
  };

  const moveTask = async (taskId: string, newStatus: TodoTask["status"]) => {
    await updateTaskStatus(taskId, newStatus);
  };

  const handleDelete = async (taskId: string) => {
    if (confirm(t("kanban.deleteConfirm"))) {
      await deleteTask(taskId);
    }
  };

  const columns: {
    id: TodoTask["status"];
    titleKey: string;
    icon: any;
    color: string;
    bg: string;
    glow: string;
  }[] = [
    {
      id: "todo",
      titleKey: "kanban.colTodo",
      icon: Circle,
      color: "text-slate-400 dark:text-slate-500",
      bg: "bg-slate-100/40 dark:bg-slate-900/40",
      glow: "group-hover:shadow-[0_0_30px_rgba(148,163,184,0.15)]",
    },
    {
      id: "in-progress",
      titleKey: "kanban.colInProgress",
      icon: Zap,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-50/40 dark:bg-indigo-950/20",
      glow: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]",
    },
    {
      id: "done",
      titleKey: "kanban.colDone",
      icon: CheckCircle2,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50/40 dark:bg-emerald-950/20",
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    },
  ];

  if (loading && !tasks.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Zap className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center bg-white/70 dark:bg-slate-900/70 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

          <div className="relative z-10 text-center md:text-right mb-6 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {t("kanban.title").split(" ")[0]}{" "}
              <span className="text-primary italic">MINDAR</span>{" "}
              {t("kanban.title").split(" ").slice(2).join(" ")} 🏗️
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg max-w-md">
              {t("kanban.subtitle")}
            </p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto relative z-10 rounded-2xl md:rounded-[1.5rem] h-14 md:h-16 px-8 md:px-10 font-black text-lg shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-indigo-600 hover:scale-[1.05] active:scale-[0.95] transition-all border border-white/20">
                <Plus className={`${isAr ? "ml-3" : "mr-3"} w-6 h-6`} />
                {t("kanban.newTask")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2rem] md:rounded-[3rem] border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle
                  className={`${isAr ? "text-right" : "text-left"} text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600`}
                >
                  {t("kanban.newTask")} 💎
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 md:space-y-6 py-4 md:py-6">
                <div className="space-y-2">
                  <label
                    className={`block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ${isAr ? "mr-2 text-right" : "ml-2 text-left"}`}
                  >
                    {t("kanban.taskTitle")}
                  </label>
                  <Input
                    placeholder={t("kanban.taskTitlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`${isAr ? "text-right" : "text-left"} h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary/20 transition-all font-black text-lg`}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className={`block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ${isAr ? "mr-2 text-right" : "ml-2 text-left"}`}
                  >
                    {t("kanban.taskDesc")}
                  </label>
                  <Textarea
                    placeholder={t("kanban.taskDescPlaceholder")}
                    value={desc}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setDesc(e.target.value)
                    }
                    className={`${isAr ? "text-right" : "text-left"} h-24 md:h-32 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary/20 transition-all font-bold resize-none`}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label
                      className={`block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ${isAr ? "mr-2 text-right" : "ml-2 text-left"}`}
                    >
                      {t("kanban.taskDate")}
                    </label>
                    <DateTimePicker date={date} setDate={setDate} />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ${isAr ? "mr-2 text-right" : "ml-2 text-left"}`}
                    >
                      {t("kanban.taskPriority")}
                    </label>
                    <div className="flex gap-2">
                      {(["low", "medium", "high"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPriority(p)}
                          className={`flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black border-2 md:border-4 transition-all ${
                            priority === p
                              ? "border-primary bg-primary/10 text-primary shadow-lg"
                              : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {p === "high"
                            ? t("kanban.taskPriorityHigh")
                            : p === "medium"
                              ? t("kanban.taskPriorityMedium")
                              : t("kanban.taskPriorityLow")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!title.trim() || isSaving}
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg md:text-xl mt-4 md:mt-6 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isSaving ? t("kanban.saving") : t("kanban.submitTask")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {columns.map((col, idx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, x: isAr ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col gap-6 group/col"
            >
              <div
                className={`flex items-center justify-between px-4 sm:px-6 py-2`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/col:scale-110 bg-white dark:bg-slate-900 ${col.color}`}
                  >
                    <col.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase underline decoration-primary/20 decoration-4 underline-offset-8">
                    {t(col.titleKey)}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-600 dark:text-slate-400 border border-white/50">
                  {tasks.filter((t) => t.status === col.id).length}
                </div>
              </div>

              <div
                className={`flex-1 min-h-[500px] lg:min-h-[650px] p-4 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-dashed transition-all duration-500 overflow-y-auto max-h-[700px] no-scrollbar ${col.bg} border-slate-200 dark:border-white/5 shadow-inner`}
              >
                <AnimatePresence mode="popLayout">
                  {tasks
                    .filter((t) => t.status === col.id)
                    .map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: isAr ? -50 : 50 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                        className="mb-4 last:mb-0"
                      >
                        <Card
                          className={`group relative overflow-hidden border border-transparent dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ${col.glow} ${
                            task.completed ? "opacity-60 grayscale-[0.3]" : ""
                          }`}
                        >
                          <div
                            className={`absolute top-0 ${isAr ? "right-0" : "left-0"} w-2 h-full ${
                              task.priority === "high"
                                ? "bg-rose-500"
                                : task.priority === "medium"
                                  ? "bg-indigo-500"
                                  : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          />

                          <CardContent className="p-5 md:p-7">
                            <div className="flex flex-col gap-4">
                              <div className="flex justify-between items-start">
                                <span
                                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                    task.priority === "high"
                                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                      : task.priority === "medium"
                                        ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                  }`}
                                >
                                  {task.priority === "high"
                                    ? t("kanban.taskPriorityHigh")
                                        .split(" ")
                                        .slice(1)
                                        .join(" ")
                                    : task.priority === "medium"
                                      ? t("kanban.taskPriorityMedium")
                                          .split(" ")
                                          .slice(1)
                                          .join(" ")
                                      : t("kanban.taskPriorityLow")
                                          .split(" ")
                                          .slice(1)
                                          .join(" ")}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 md:w-10 md:h-10 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-all"
                                  onClick={() =>
                                    task.id && handleDelete(task.id)
                                  }
                                >
                                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                              </div>

                              <h3
                                className={`text-lg md:text-xl font-black leading-tight tracking-tight ${isAr ? "text-right" : "text-left"} ${task.completed ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}
                              >
                                {task.title}
                              </h3>

                              {task.description && (
                                <p
                                  className={`text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed ${isAr ? "text-right" : "text-left"}`}
                                >
                                  {task.description}
                                </p>
                              )}

                              {task.scheduledAt && (
                                <div
                                  className={`flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 p-2 rounded-xl border border-indigo-500/10 ${isAr ? "flex-row-reverse" : ""}`}
                                >
                                  <Calendar className="w-4 h-4" />
                                  {format(task.scheduledAt, "PPP p", {
                                    locale: dateLocale,
                                  })}
                                </div>
                              )}

                              <div
                                className={`flex items-center justify-between mt-2 md:mt-4 pt-4 border-t border-slate-100 dark:border-white/5`}
                              >
                                <div
                                  className={`flex gap-2 ${isAr ? "flex-row-reverse" : ""}`}
                                >
                                  {col.id !== "todo" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 md:h-10 px-3 md:px-4 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                                      onClick={() =>
                                        task.id &&
                                        moveTask(
                                          task.id,
                                          col.id === "done"
                                            ? "in-progress"
                                            : "todo",
                                        )
                                      }
                                    >
                                      {isAr ? (
                                        <ChevronRight className="w-4 h-4" />
                                      ) : (
                                        <ChevronLeft className="w-4 h-4 ml-1" />
                                      )}
                                      <span className="hidden sm:inline">
                                        {t("kanban.prev")}
                                      </span>
                                    </Button>
                                  )}
                                  {col.id !== "done" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 md:h-10 px-3 md:px-4 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                                      onClick={() =>
                                        task.id &&
                                        moveTask(
                                          task.id,
                                          col.id === "todo"
                                            ? "in-progress"
                                            : "done",
                                        )
                                      }
                                    >
                                      <span className="hidden sm:inline">
                                        {t("kanban.next")}
                                      </span>
                                      {isAr ? (
                                        <ChevronLeft className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 mr-1" />
                                      )}
                                    </Button>
                                  )}
                                </div>

                                {col.id === "in-progress" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all hover:scale-110 active:scale-90"
                                    onClick={() => {
                                      window.dispatchEvent(
                                        new CustomEvent(
                                          "start-pomodoro-focus",
                                          {
                                            detail: { taskName: task.title },
                                          },
                                        ),
                                      );
                                    }}
                                  >
                                    <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </AnimatePresence>

                {tasks.filter((t) => t.status === col.id).length === 0 && (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-300 dark:text-slate-800 gap-4">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-current flex items-center justify-center opacity-20">
                      <Sparkles className="w-10 h-10" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">
                      {t("kanban.noTasks")}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
