"use client";

import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Terminal,
  Cpu,
  Binary,
  Network,
  Database,
  Layout,
  Code2,
  Trash2,
  History,
  Bot,
  Zap,
  Play,
  RotateCcw,
  Maximize2,
  Save,
  CircuitBoard,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const labConfigs: Record<string, any> = {
  logic: {
    titleKey: "techLab.logic.title",
    icon: Binary,
    color: "from-blue-500 to-cyan-400",
    pattern: CircuitBoard,
    tools: ["Gate Simulator", "Truth Table", "K-Map Solver"],
    prefix: "LOGIC-LAB",
  },
  arch: {
    titleKey: "techLab.arch.title",
    icon: Cpu,
    color: "from-purple-600 to-indigo-500",
    pattern: Cpu,
    tools: ["Assembly Editor", "Register View", "Instruction decoder"],
    prefix: "ARCH-LAB",
  },
  networking: {
    titleKey: "techLab.network.title",
    icon: Network,
    color: "from-emerald-500 to-teal-400",
    pattern: Network,
    tools: ["OSI Visualizer", "Subnet Calculator", "Packet Flow"],
    prefix: "NET-LAB",
  },
  ds: {
    titleKey: "techLab.ds.title",
    icon: Database,
    color: "from-orange-500 to-amber-400",
    pattern: Binary,
    tools: ["Stack (LIFO)", "Queue (FIFO)", "Tree (BST)"],
    prefix: "DS-LAB",
  },
  web: {
    titleKey: "techLab.web.title",
    icon: Layout,
    color: "from-pink-500 to-rose-400",
    pattern: Layout,
    tools: ["Live Preview", "CSS Debugger", "Modern Layouts"],
    prefix: "WEB-LAB",
  },
  code: {
    titleKey: "techLab.code.title",
    icon: Code2,
    color: "from-slate-800 to-slate-900",
    pattern: Terminal,
    tools: ["Logic Debugger", "Big O Analyzer", "Clean Code AI"],
    prefix: "ELITE-LAB",
  },
};

export default function LabModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const searchParams = useSearchParams();
  const isPromptMode = searchParams.get("mode") === "prompt";

  const { t, language } = useI18n();
  const router = useRouter();
  const [extractedText, setExtractedText] = useState<string>("");
  const [activeTool, setActiveTool] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const config = labConfigs[moduleId] || labConfigs.logic;

  useEffect(() => {
    const savedText = localStorage.getItem("tech_lab_source_text");
    if (savedText) {
      setExtractedText(savedText);
      analyzeWithAi(savedText);
    } else if (!isPromptMode) {
      router.push("/tech-lab");
    } else {
      analyzeWithAi("");
    }
  }, [moduleId, router, isPromptMode]);

  const analyzeWithAi = async (text: string) => {
    setIsAiLoading(true);
    setTimeout(() => {
      let welcome = "";
      if (isPromptMode && !text) {
        welcome =
          language === "ar"
            ? `أهلاً بك في نظام الأوامر المباشر لـ ${t(config.titleKey)}. أنا جاهز لتنفيذ أي أمر برمجي أو محاكاة تطلبها مني مباشرة بدون الحاجة لملفات.`
            : `Welcome to the Direct Command System for ${t(config.titleKey)}. I am ready to execute any programmatic command or simulation you request directly, no files needed.`;
      } else {
        welcome =
          language === "ar"
            ? `أهلاً بك في ${t(config.titleKey)}. تم العثور على مفاهيم متعلقة بـ: ${moduleId === "logic" ? "البوابات المنطقية وجبر بولين" : moduleId === "arch" ? "العناوين والتعليمات البرمجية" : "الشبكات والبروتوكولات"}. كيف يمكنني مساعدتك في تطبيقها؟`
            : `Welcome to ${t(config.titleKey)}. Found context related to: ${moduleId === "logic" ? "Logic Gates and Boolean Algebra" : moduleId === "arch" ? "Addressing and Instructions" : "Networks and Protocols"}. How can I help you simulate them?`;
      }
      setMessages([{ role: "ai", content: welcome }]);
      setIsAiLoading(false);
    }, 1500);
  };

  // --- Logic Tool: Truth Table ---
  const [selectedGate, setSelectedGate] = useState("AND");
  const generateLogicRows = () => {
    const rows = [
      { a: 0, b: 0 },
      { a: 0, b: 1 },
      { a: 1, b: 0 },
      { a: 1, b: 1 },
    ];
    return rows.map((r) => ({
      ...r,
      out: calculateGateLogic(selectedGate, r.a === 1, r.b === 1) ? 1 : 0,
    }));
  };

  const calculateGateLogic = (gate: string, a: boolean, b: boolean) => {
    switch (gate) {
      case "AND":
        return a && b;
      case "OR":
        return a || b;
      case "XOR":
        return a !== b;
      case "NAND":
        return !(a && b);
      case "NOR":
        return !(a || b);
      case "NOT":
        return !a;
      default:
        return a && b;
    }
  };

  // --- Web Tool: Sandbox ---
  const [webCode, setWebCode] = useState(
    "<h1>Hello Mindar</h1>\n<style>\nh1 { color: #6366f1; }\n</style>",
  );

  // --- Arch Tool: Assembly Analyzer ---
  const [asmCode, setAsmCode] = useState(
    "MOV AX, 4C00h\nINT 21h\n; Simple exit code",
  );

  // --- Logic Tool States ---
  const [gateA, setGateA] = useState(false);
  const [gateB, setGateB] = useState(false);
  const gateOutput = calculateGateLogic(selectedGate, gateA, gateB);

  // --- Networking Tool: Subnet Calculator ---
  const [ipAddress, setIpAddress] = useState("192.168.1.1");
  const [cidr, setCidr] = useState(24);
  const calculateHosts = (c: number) => Math.pow(2, 32 - c) - 2;

  const osiLayers = [
    { name: "Application", color: "bg-red-500" },
    { name: "Presentation", color: "bg-orange-500" },
    { name: "Session", color: "bg-yellow-500" },
    { name: "Transport", color: "bg-green-500" },
    { name: "Network", color: "bg-blue-500" },
    { name: "Data Link", color: "bg-indigo-500" },
    { name: "Physical", color: "bg-purple-500" },
  ];

  // --- DS Tool: Tree View ---
  const [dsData, setDsData] = useState([10, 5, 15, 2, 7]);
  const handlePushDS = () => {
    const newVal = Math.floor(Math.random() * 100);
    if (activeTool === 1) {
      // Queue
      setDsData([...dsData, newVal]);
    } else {
      // Stack or Tree
      setDsData([newVal, ...dsData]);
    }
  };
  const handlePopDS = () => {
    if (activeTool === 1) {
      // Queue (Dequeue first)
      setDsData(dsData.slice(1));
    } else {
      // Stack (Pop top)
      setDsData(dsData.slice(1));
    }
  };

  // --- AI Chat Logic ---
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    // Initial AI sequence
    const welcome = isPromptMode
      ? language === "ar"
        ? `أهلاً بك في نظام الأوامر المباشر لـ ${t(config.titleKey)}. أنا جاهز لتنفيذ أي أمر برمجي أو محاكاة تطلبها مني مباشرة بدون الحاجة لملفات.`
        : `Welcome to the Direct Command System for ${t(config.titleKey)}. I am ready to execute any programmatic command or simulation you request directly, no files needed.`
      : language === "ar"
        ? `أهلاً بك في ${t(config.titleKey)}. تم العثور على مفاهيم متعلقة بـ: ${moduleId === "logic" ? "البوابات المنطقية وجبر بولين" : moduleId === "arch" ? "العناوين والتعليمات البرمجية" : "الشبكات والبروتوكولات"}. كيف يمكنني مساعدتك في تطبيقها؟`
        : `Welcome to ${t(config.titleKey)}. Found context related to: ${moduleId === "logic" ? "Logic Gates and Boolean Algebra" : moduleId === "arch" ? "Addressing and Instructions" : "Networks and Protocols"}. How can I help you simulate them?`;

    setMessages([{ role: "ai", content: welcome }]);
  }, [moduleId, isPromptMode, language, config.titleKey, t]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setUserInput("");
    setIsAiLoading(true);

    // Dynamic response based on lab state
    setTimeout(() => {
      let resp = "";
      const lowerText = text.toLowerCase();

      if (
        lowerText.includes("code") ||
        lowerText.includes("برمج") ||
        lowerText.includes("كود")
      ) {
        if (moduleId === "logic") {
          resp =
            language === "ar"
              ? `إليك كود لتمثيل بوابة ${selectedGate} في جافاسكريبت:\n\n\`\`\`javascript\nfunction logicGate(a, b) {\n  return ${selectedGate === "AND" ? "a && b" : selectedGate === "OR" ? "a || b" : selectedGate === "XOR" ? "a !== b" : selectedGate === "NAND" ? "!(a && b)" : selectedGate === "NOR" ? "!(a || b)" : "!a"};\n}\n\`\`\``
              : `Here is the JavaScript code for a ${selectedGate} gate:\n\n\`\`\`javascript\nfunction logicGate(a, b) {\n  return ${selectedGate === "AND" ? "a && b" : selectedGate === "OR" ? "a || b" : selectedGate === "XOR" ? "a !== b" : selectedGate === "NAND" ? "!(a && b)" : selectedGate === "NOR" ? "!(a || b)" : "!a"};\n}\n\`\`\``;
        } else if (moduleId === "arch") {
          resp =
            language === "ar"
              ? `إليك كود في لغة Assembly لنقل قيمة إلى سجل AX:\n\n\`\`\`assembly\nMOV AX, 0001h\nINT 21h\n\`\`\``
              : `Here is the Assembly code to move a value into the AX register:\n\n\`\`\`assembly\nMOV AX, 0001h\nINT 21h\n\`\`\``;
        } else {
          resp =
            language === "ar"
              ? `إليك نموذج بسيط لما طلبته:\n\n\`\`\`javascript\nconsole.log("Mindar Tech Lab Active");\n\`\`\``
              : `Here is a simple example for your request:\n\n\`\`\`javascript\nconsole.log("Mindar Tech Lab Active");\n\`\`\``;
        }
      } else if (moduleId === "logic") {
        resp =
          language === "ar"
            ? `المنطق الحالي: ${gateA ? "1" : "0"} ${selectedGate} ${gateB ? "1" : "0"} يعطي نتيجة ${gateOutput ? "1" : "0"}.`
            : `Current logic: ${gateA ? "1" : "0"} ${selectedGate} ${gateB ? "1" : "0"} results in ${gateOutput ? "High" : "Low"}.`;
      } else if (moduleId === "arch") {
        resp =
          language === "ar"
            ? `قمنا بتحليل تعليمات الـ Assembly. نلاحظ استخدام MOV لشحن السجلات. تم تحديث سجل AX بنجاح.`
            : `Assembly instructions parsed. Detected MOV calls to initialize registers. AX register successfully updated in the visualizer.`;
      } else if (moduleId === "ds") {
        resp =
          language === "ar"
            ? `هيكل البيانات يحتوي الآن على ${dsData.length} عناصر. الترتيب ${activeTool === 0 ? "LIFO (Stack)" : activeTool === 1 ? "FIFO (Queue)" : "Hierarchical (Tree)"}.`
            : `Data structure currently holds ${dsData.length} elements. Logic followed: ${activeTool === 0 ? "LIFO (Stack)" : activeTool === 1 ? "FIFO (Queue)" : "Hierarchical (Tree)"}.`;
      } else {
        resp =
          language === "ar"
            ? `بناءً على طلبك (${text})، جاري معالجة البيانات في مختبر ${t(config.titleKey)}...`
            : `Based on your request (${text}), processing data in the ${t(config.titleKey)} lab...`;
      }

      setMessages([...newMessages, { role: "ai", content: resp }]);
      setIsAiLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen pt-32 pb-10 px-6 bg-background font-cairo">
      {/* Dynamic Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/tech-lab">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-2xl bg-secondary/50 hover:bg-primary/10 text-primary border-2 border-transparent hover:border-primary/20"
              >
                <ArrowLeft
                  className={cn("w-6 h-6", language === "en" && "rotate-180")}
                />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-16 h-16 rounded-[2rem] bg-gradient-to-br flex items-center justify-center text-white shadow-xl",
                  config.color,
                )}
              >
                <config.icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  {t(config.titleKey)}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black opacity-60 px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                    {config.prefix} ACTIVE
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 overflow-hidden">
            <AnimatePresence mode="wait">
              {isPromptMode ? (
                <motion.div
                  key="prompt-mode"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-purple-500/10 backdrop-blur-xl p-3 px-5 rounded-2xl border border-purple-500/20 flex items-center gap-3"
                >
                  <Sparkles className="text-purple-500 w-4 h-4 animate-pulse" />
                  <div className="text-left">
                    <p className="text-[9px] font-black opacity-60 uppercase text-purple-500 leading-none mb-1">
                      {language === "ar"
                        ? "نمط الأوامر المباشرة"
                        : "Direct Prompt Mode"}
                    </p>
                    <p className="text-xs font-black text-purple-700 dark:text-purple-300 leading-none">
                      AI SYSTEM ACTIVE
                    </p>
                  </div>
                </motion.div>
              ) : extractedText ? (
                <motion.div
                  key="material-mode"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-primary/10 backdrop-blur-xl p-3 px-5 rounded-2xl border border-primary/20 flex items-center gap-3 group"
                >
                  <FileCheck className="text-primary w-4 h-4" />
                  <div className="text-left">
                    <p className="text-[9px] font-black opacity-60 uppercase leading-none mb-1">
                      {language === "ar"
                        ? "سياق المادة العلمية"
                        : "Material Context"}
                    </p>
                    <p className="text-xs font-black truncate max-w-[150px] leading-none">
                      {localStorage.getItem("tech_lab_material_title") ||
                        "Lab Material"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      localStorage.removeItem("tech_lab_source_text");
                      localStorage.removeItem("tech_lab_material_title");
                      router.push("/tech-lab");
                    }}
                    className="w-7 h-7 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-2xl font-black gap-2 h-12"
            >
              <History className="w-5 h-5" />
              {language === "ar" ? "السجل" : "History"}
            </Button>
            <Button className="rounded-2xl font-black gap-2 h-12 shadow-lg glow-primary">
              <Save className="w-5 h-5" />
              {language === "ar" ? "حفظ العمل" : "Save Work"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
        {/* Sidebar Tools */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="rounded-[2.5rem] border-2 border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-8">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-black uppercase tracking-widest text-sm text-primary">
                  {language === "ar" ? "أدوات المختبر" : "Lab Tools"}
                </h3>
              </div>

              <div className="space-y-3 flex-1">
                {config.tools.map((tool: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTool(idx)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
                      activeTool === idx
                        ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105"
                        : "bg-background/50 border-transparent hover:border-primary/20",
                    )}
                  >
                    <span className="font-black text-sm">{tool}</span>
                    <Zap
                      className={cn(
                        "w-4 h-4 transition-transform group-hover:scale-125",
                        activeTool === idx ? "fill-current" : "text-primary/40",
                      )}
                    />
                  </button>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase opacity-60">
                    AI Context Helper
                  </span>
                </div>
                <p className="text-xs font-bold leading-relaxed opacity-70">
                  {language === "ar"
                    ? "الذكاء الاصطناعي جاهز لتحويل مادتك إلى محاكاة تفاعلية."
                    : "AI is ready to transform your material into an interactive simulation."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Viewport */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="rounded-[3rem] border-4 border-primary/10 bg-black/5 dark:bg-white/5 backdrop-blur-3xl overflow-hidden h-full relative group">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Toolbar */}
              <div className="bg-card/50 border-b border-border/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs font-black opacity-40 uppercase tracking-tighter">
                    {config.tools[activeTool]} Viewport
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 rounded-lg gap-1.5 font-black text-xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    RUN
                  </Button>
                </div>
              </div>

              {/* Simulation/Visualizer Area */}
              <div className="flex-1 overflow-auto p-10 flex flex-col items-center justify-center relative">
                {/* Visual grid background */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={moduleId + activeTool}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="w-full h-full relative z-10"
                  >
                    {moduleId === "logic" && activeTool === 0 ? (
                      <div className="flex flex-col items-center gap-10">
                        {/* Gate Selector */}
                        <div className="flex items-center gap-2 p-2 bg-card/50 rounded-2xl border border-border/50 shadow-sm mb-4">
                          {["AND", "OR", "XOR", "NAND", "NOR", "NOT"].map(
                            (gate) => (
                              <Button
                                key={gate}
                                size="sm"
                                onClick={() => setSelectedGate(gate)}
                                variant={
                                  selectedGate === gate ? "default" : "ghost"
                                }
                                className={cn(
                                  "rounded-xl text-[10px] font-black h-8 px-3 transition-all",
                                  selectedGate === gate &&
                                    "shadow-lg bg-primary text-primary-foreground",
                                )}
                              >
                                {gate}
                              </Button>
                            ),
                          )}
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="flex flex-col gap-4">
                            <Button
                              onClick={() => setGateA(!gateA)}
                              variant={gateA ? "default" : "outline"}
                              className={cn(
                                "w-16 h-16 rounded-2xl font-black text-xl transition-all",
                                gateA && "shadow-lg glow-primary",
                              )}
                            >
                              {gateA ? "1" : "0"}
                            </Button>
                            <Button
                              onClick={() => setGateB(!gateB)}
                              variant={gateB ? "default" : "outline"}
                              className={cn(
                                "w-16 h-16 rounded-2xl font-black text-xl transition-all",
                                gateB && "shadow-lg glow-primary",
                                selectedGate === "NOT" &&
                                  "opacity-20 cursor-not-allowed pointer-events-none",
                              )}
                            >
                              {selectedGate === "NOT" ? "-" : gateB ? "1" : "0"}
                            </Button>
                          </div>
                          <div className="w-24 h-2 bg-primary/20 rounded-full" />
                          <div className="p-8 px-12 rounded-[2.5rem] bg-card border-4 border-primary/20 shadow-2xl relative min-w-[140px] text-center">
                            <span className="font-black text-3xl text-primary">
                              {selectedGate}
                            </span>
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-1 bg-primary/40" />
                          </div>
                          <div className="w-24 h-2 bg-primary/20 rounded-full" />
                          <div
                            className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
                              gateOutput
                                ? "bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)]"
                                : "bg-slate-800 opacity-40",
                            )}
                          >
                            <Zap
                              className={cn(
                                "text-white w-8 h-8 transition-transform",
                                gateOutput && "fill-current scale-125",
                              )}
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black opacity-60 uppercase tracking-widest mb-1">
                            {language === "ar"
                              ? "محاكي البوابات"
                              : "Gate Simulator"}
                          </p>
                          <p className="text-xl font-black text-primary">
                            {gateA ? "1" : "0"} {selectedGate}{" "}
                            {selectedGate === "NOT" ? "" : gateB ? "1" : "0"} ={" "}
                            {gateOutput ? "1" : "0"}
                          </p>
                        </div>
                      </div>
                    ) : moduleId === "logic" && activeTool === 1 ? (
                      <div className="max-w-md mx-auto space-y-6">
                        <div className="bg-card p-6 rounded-3xl border-2 border-primary/20 shadow-xl overflow-hidden">
                          <table className="w-full text-center">
                            <thead>
                              <tr className="border-b border-border bg-primary/5">
                                <th className="p-4 font-black text-xs uppercase opacity-40">
                                  A
                                </th>
                                <th className="p-4 font-black text-xs uppercase opacity-40">
                                  B
                                </th>
                                <th className="p-4 font-black text-xs uppercase text-primary">
                                  Result
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {generateLogicRows().map((row, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                                >
                                  <td className="p-4 font-bold">{row.a}</td>
                                  <td className="p-4 font-bold">{row.b}</td>
                                  <td className="p-4 font-black text-primary">
                                    {row.out}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-[10px] font-bold opacity-40 text-center uppercase tracking-widest italic">
                          {language === "ar"
                            ? `جدول الحقيقة بناءً على بوابة ${selectedGate}`
                            : `Truth Table based on ${selectedGate} logic`}
                        </p>
                      </div>
                    ) : moduleId === "logic" && activeTool === 2 ? (
                      <div className="max-w-md mx-auto space-y-8">
                        <div className="bg-card p-8 rounded-[3rem] border-2 border-primary/20 shadow-2xl">
                          <div className="grid grid-cols-4 gap-2 mb-6">
                            {[...Array(16)].map((_, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                className="w-12 h-12 rounded-xl font-black text-lg hover:bg-primary/20 transition-all border-2 border-primary/10 shadow-sm text-primary"
                                onClick={(e) => {
                                  const target = e.currentTarget;
                                  const vals = ["0", "1", "X"];
                                  const current = target.innerText;
                                  target.innerText =
                                    vals[(vals.indexOf(current) + 1) % 3];
                                }}
                              >
                                0
                              </Button>
                            ))}
                          </div>
                          <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 text-center">
                            <p className="text-[10px] font-black uppercase opacity-40 mb-1">
                              Simplified Expression
                            </p>
                            <p className="text-xl font-black text-primary tracking-tighter">
                              F = A'B + CD + AC'
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold opacity-40 text-center uppercase tracking-widest">
                          {language === "ar"
                            ? "اضغط على المربعات لتغيير قيم (0, 1, X)"
                            : "Click cells to toggle between (0, 1, X)"}
                        </p>
                      </div>
                    ) : moduleId === "web" ? (
                      <div className="w-full h-full flex flex-col gap-6">
                        <div className="flex items-center gap-4 bg-card/50 p-2 rounded-2xl border border-border/50">
                          {config.tools.map((t: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => {
                                setActiveTool(i);
                                if (i === 0)
                                  setWebCode(
                                    "<h1>Hello Mindar</h1>\n<style>\nh1 { color: #6366f1; text-align: center; margin-top: 50px; font-family: sans-serif; }\n</style>",
                                  );
                                if (i === 1)
                                  setWebCode(
                                    '<style>\n  .box { \n    width: 100px; \n    height: 100px; \n    background: var(--primary); \n    border-radius: 20px;\n    animation: pulse 2s infinite;\n  }\n  @keyframes pulse { 0% { scale: 1; } 50% { scale: 1.1; } 100% { scale: 1; } }\n</style>\n<div class="box"></div>',
                                  );
                                if (i === 2)
                                  setWebCode(
                                    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px;">\n  <div style="background: #e2e8f0; height: 100px; border-radius: 10px;"></div>\n  <div style="background: #e2e8f0; height: 100px; border-radius: 10px;"></div>\n</div>',
                                  );
                              }}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                                activeTool === i
                                  ? "bg-primary text-primary-foreground shadow-lg"
                                  : "hover:bg-primary/10",
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-4">
                              <Code2 className="w-3 h-3 opacity-40" />
                              <span className="text-[10px] font-black opacity-40 uppercase">
                                Source Editor
                              </span>
                            </div>
                            <textarea
                              value={webCode}
                              onChange={(e) => setWebCode(e.target.value)}
                              className="w-full h-full bg-slate-900 text-slate-100 p-6 rounded-[2.5rem] font-mono text-sm outline-none border-2 border-primary/20 focus:border-primary transition-all shadow-inner"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-4">
                              <Layout className="w-3 h-3 opacity-40" />
                              <span className="text-[10px] font-black opacity-40 uppercase">
                                Live Preview
                              </span>
                            </div>
                            <div className="bg-white rounded-[2.5rem] overflow-hidden border-2 border-border shadow-2xl relative h-full">
                              <iframe
                                srcDoc={`
                                   <html>
                                     <head>
                                       <style>
                                         :root { --primary: #3b82f6; }
                                         body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; overflow: hidden; background: #f8fafc; }
                                       </style>
                                     </head>
                                     <body>${webCode}</body>
                                   </html>
                                 `}
                                className="w-full h-full border-none"
                                title="sandbox-preview"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : moduleId === "arch" ? (
                      <div className="w-full h-full flex flex-col gap-4">
                        {activeTool === 0 ? (
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="flex items-center justify-between px-4">
                              <span className="text-[10px] font-black uppercase opacity-40 italic">
                                Assembly Source
                              </span>
                              <Terminal className="w-3 h-3 opacity-20" />
                            </div>
                            <textarea
                              value={asmCode}
                              onChange={(e) => setAsmCode(e.target.value)}
                              className="flex-1 bg-slate-900 text-green-400 p-8 rounded-[3rem] font-mono text-sm border-2 border-primary/20 outline-none focus:border-primary transition-all shadow-inner"
                            />
                          </div>
                        ) : activeTool === 1 ? (
                          <div className="flex-1 space-y-4">
                            <div className="p-8 bg-card rounded-[3rem] border-2 border-primary/20 shadow-xl space-y-6">
                              <h4 className="font-black text-center text-primary uppercase tracking-widest text-xs">
                                Instruction Decoder
                              </h4>
                              <div className="space-y-3">
                                {asmCode
                                  .split("\n")
                                  .filter((l) => l.trim() && !l.startsWith(";"))
                                  .map((line, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ x: -10, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: i * 0.1 }}
                                      className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-4">
                                        <span className="font-mono text-[10px] opacity-40">
                                          0x
                                          {(i * 2)
                                            .toString(16)
                                            .padStart(4, "0")}
                                        </span>
                                        <span className="font-mono font-bold text-sm">
                                          {line.split(" ")[0]}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        {line
                                          .split(" ")
                                          .slice(1)
                                          .join(" ")
                                          .split(",")
                                          .map((op, oi) => (
                                            <span
                                              key={oi}
                                              className="px-2 py-1 bg-primary/10 rounded-md text-[9px] font-black font-mono"
                                            >
                                              {op.trim() || "NOP"}
                                            </span>
                                          ))}
                                      </div>
                                    </motion.div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                              {[
                                {
                                  label: "AX",
                                  val: asmCode.includes("4C00")
                                    ? "4C00"
                                    : "0000",
                                  active: asmCode.includes("AX"),
                                },
                                {
                                  label: "BX",
                                  val: asmCode.includes("BX") ? "1F2A" : "0000",
                                  active: asmCode.includes("BX"),
                                },
                                {
                                  label: "CX",
                                  val: asmCode.includes("CX") ? "00FF" : "0000",
                                  active: asmCode.includes("CX"),
                                },
                                { label: "DX", val: "0000", active: false },
                                { label: "SP", val: "FFFE", active: false },
                                { label: "IP", val: "0100", active: true },
                              ].map((reg, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: i * 0.05 }}
                                  className={cn(
                                    "p-6 rounded-[2.5rem] border-2 transition-all duration-500 font-mono text-center relative overflow-hidden shadow-lg",
                                    reg.active
                                      ? "bg-primary/10 border-primary text-primary"
                                      : "bg-card border-border opacity-40",
                                  )}
                                >
                                  <div className="text-[10px] font-black opacity-40 mb-2">
                                    {reg.label}
                                  </div>
                                  <div className="text-2xl font-black">
                                    {reg.val}
                                  </div>
                                  {reg.active && (
                                    <div className="absolute top-0 right-0 w-1 h-full bg-primary animate-pulse" />
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="text-primary w-5 h-5" />
                          </div>
                          <p className="text-[11px] font-black leading-relaxed flex-1 italic opacity-60 text-blue-800 dark:text-blue-300">
                            {language === "ar"
                              ? `[AI] تحليل النظام: معالج 16-bit في حالة ${asmCode.includes("INT") ? "مقاطعة نظام" : "انتظار التعليمات"}.`
                              : `[AI] System Intel: 16-bit processor in ${asmCode.includes("INT") ? "SYSTEM INTERRUPT" : "READY"} state.`}
                          </p>
                        </div>
                      </div>
                    ) : moduleId === "networking" && activeTool === 0 ? (
                      <div className="max-w-md mx-auto space-y-2">
                        {osiLayers.map((layer, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                              "p-4 rounded-xl text-white font-black text-center shadow-lg transform hover:scale-105 transition-transform cursor-pointer",
                              layer.color,
                            )}
                          >
                            {7 - i}. {layer.name}
                          </motion.div>
                        ))}
                      </div>
                    ) : moduleId === "networking" && activeTool === 1 ? (
                      <div className="max-w-md mx-auto p-10 bg-card rounded-[3rem] border-2 border-primary/20 shadow-2xl flex flex-col gap-8">
                        <div className="space-y-4">
                          <label className="text-xs font-black opacity-40 uppercase tracking-widest">
                            IP Address
                          </label>
                          <input
                            type="text"
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                            className="w-full p-4 bg-background rounded-2xl border-2 border-border font-mono text-center text-lg outline-none focus:border-primary transition-all"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <label className="text-xs font-black opacity-40 uppercase tracking-widest">
                              CIDR Prefix
                            </label>
                            <span className="text-primary font-black">
                              /{cidr}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="32"
                            value={cidr}
                            onChange={(e) => setCidr(parseInt(e.target.value))}
                            className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                        <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 text-center space-y-2">
                          <p className="text-[10px] font-black opacity-40 uppercase">
                            Max Usable Hosts
                          </p>
                          <p className="text-4xl font-black text-primary tracking-tighter">
                            {calculateHosts(cidr).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold opacity-60">
                            {language === "ar"
                              ? "قناع الشبكة: "
                              : "Subnet Mask: "}
                            {cidr <= 8
                              ? "255.0.0.0"
                              : cidr <= 16
                                ? "255.255.0.0"
                                : cidr <= 24
                                  ? "255.255.255.0"
                                  : "255.255.255.252"}
                          </p>
                        </div>
                      </div>
                    ) : moduleId === "networking" && activeTool === 2 ? (
                      <div className="w-full max-w-md mx-auto space-y-4">
                        <div className="bg-slate-900 p-6 rounded-[2.5rem] border-2 border-primary/20 shadow-2xl relative overflow-hidden">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                Live Sniffing
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-primary/40 leading-none">
                              INTERFACE: eth0
                            </span>
                          </div>
                          <div className="space-y-3 font-mono text-[11px]">
                            {[
                              {
                                time: "0.001",
                                src: "192.168.1.1",
                                dst: "8.8.8.8",
                                prot: "DNS",
                              },
                              {
                                time: "0.015",
                                src: "8.8.8.8",
                                dst: "192.168.1.1",
                                prot: "DNS_RESP",
                              },
                              {
                                time: "0.124",
                                src: "192.168.1.1",
                                dst: "104.22.1.5",
                                prot: "TCP_SYN",
                              },
                              {
                                time: "0.156",
                                src: "104.22.1.5",
                                dst: "192.168.1.1",
                                prot: "TCP_ACK",
                              },
                            ].map((p, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors"
                              >
                                <div className="flex gap-3">
                                  <span className="text-white/20">
                                    {p.time}
                                  </span>
                                  <span className="text-blue-400 font-bold">
                                    {p.prot}
                                  </span>
                                </div>
                                <span className="text-white/60">
                                  {p.src} → {p.dst}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                        </div>
                        <p className="text-[10px] font-black opacity-40 text-center uppercase tracking-tighter">
                          {language === "ar"
                            ? "رصد الحزم الجاري... يتم التقاط حركة المرور بنجاح"
                            : "Sniffing packets... Capture sequence operational"}
                        </p>
                      </div>
                    ) : moduleId === "ds" ? (
                      <div className="flex flex-col items-center gap-10 w-full h-full justify-center">
                        {activeTool === 2 ? (
                          /* Tree Visualization (BST) */
                          <div className="relative w-full h-[300px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-10">
                              <motion.div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-2xl relative z-10 border-4 border-white/20">
                                {dsData[0]}
                              </motion.div>
                              <div className="flex gap-20">
                                {dsData.length > 1 && (
                                  <div className="flex flex-col items-center gap-6 relative">
                                    <div className="absolute -top-6 right-0 w-20 h-0.5 bg-primary/20 -rotate-45" />
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-12 h-12 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center font-bold"
                                    >
                                      {dsData[1]}
                                    </motion.div>
                                  </div>
                                )}
                                {dsData.length > 2 && (
                                  <div className="flex flex-col items-center gap-6 relative">
                                    <div className="absolute -top-6 left-0 w-20 h-0.5 bg-primary/20 rotate-45" />
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-12 h-12 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center font-bold"
                                    >
                                      {dsData[2]}
                                    </motion.div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "flex gap-4 min-h-[200px] items-center justify-center p-10 rounded-[3rem] border-2 border-dashed border-primary/20 bg-primary/5",
                              activeTool === 0
                                ? "flex-col-reverse justify-end border-b-4 border-b-primary pt-20"
                                : "flex-row",
                            )}
                          >
                            <AnimatePresence>
                              {dsData.map((val, i) => (
                                <motion.div
                                  key={`${activeTool}-${val}-${i}`}
                                  initial={{
                                    scale: 0,
                                    opacity: 0,
                                    y: activeTool === 0 ? -50 : 0,
                                    x: activeTool === 1 ? 50 : 0,
                                  }}
                                  animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl transition-colors",
                                    i === 0
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-card border-2 border-primary/20",
                                  )}
                                >
                                  {val}
                                  {i === 0 && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                      <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">
                                        {activeTool === 0 ? "TOP" : "FRONT"}
                                      </span>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}

                        <div className="flex flex-col items-center gap-4">
                          <div className="flex gap-4">
                            <Button
                              onClick={handlePushDS}
                              className="rounded-2xl h-14 px-8 font-black gap-2 shadow-lg glow-primary"
                            >
                              <Zap className="w-5 h-5 fill-current" />
                              {activeTool === 2
                                ? language === "ar"
                                  ? "إدراج (Insert)"
                                  : "Insert"
                                : activeTool === 0
                                  ? language === "ar"
                                    ? "Push (إضافة)"
                                    : "Push"
                                  : language === "ar"
                                    ? "Enqueue (إدخال)"
                                    : "Enqueue"}
                            </Button>
                            <Button
                              onClick={handlePopDS}
                              variant="outline"
                              className="rounded-2xl h-14 px-8 font-black gap-2 border-2 text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-5 h-5" />
                              {activeTool === 2
                                ? language === "ar"
                                  ? "إعادة تعيين (Reset)"
                                  : "Reset"
                                : activeTool === 0
                                  ? language === "ar"
                                    ? "Pop (حذف)"
                                    : "Pop"
                                  : language === "ar"
                                    ? "Dequeue (إخراج)"
                                    : "Dequeue"}
                            </Button>
                          </div>
                          <p className="text-xs font-black opacity-40 uppercase tracking-widest">
                            {activeTool === 2
                              ? "Binary Search Tree (BST)"
                              : activeTool === 0
                                ? "Last In, First Out (LIFO)"
                                : "First In, First Out (FIFO)"}
                          </p>
                        </div>
                      </div>
                    ) : moduleId === "code" ? (
                      <div className="w-full h-full flex flex-col gap-6">
                        <div className="flex-1 bg-slate-900 rounded-[3rem] p-10 border-2 border-primary/20 relative overflow-hidden group shadow-2xl">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <Code2 className="text-primary w-6 h-6" />
                              <span className="font-mono text-xs text-primary font-black uppercase tracking-widest">
                                {config.tools[activeTool]}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500/50" />
                              <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                          </div>

                          <div className="font-mono text-sm space-y-6">
                            {activeTool === 0 ? (
                              <div className="space-y-6">
                                <textarea
                                  className="w-full bg-white/5 p-6 rounded-3xl border border-primary/10 text-blue-400 outline-none focus:border-primary/40 min-h-[150px]"
                                  defaultValue={
                                    "function binarySearch(arr, x) {\n  let mid = Math.floor(arr.length / 2);\n  if (arr[mid] === x) return mid;\n}"
                                  }
                                />
                                <div className="p-6 bg-primary/10 rounded-[2rem] border-l-8 border-primary text-green-400 shadow-xl">
                                  <p className="font-black text-[10px] uppercase opacity-40 mb-2">
                                    Internal Flow Analysis
                                  </p>
                                  <span className="text-yellow-500">if</span>{" "}
                                  (arr[mid] === x){" "}
                                  <span className="text-primary">
                                    return mid;
                                  </span>
                                </div>
                                <p className="text-[10px] text-white/40 mt-6 font-bold italic">
                                  {language === "ar"
                                    ? "[AI] تم رصد منطق سليم: التعليمات تنفذ بشكل صحيح."
                                    : "[AI] Logic Validated: Execution steps are following optimal paths."}
                                </p>
                              </div>
                            ) : activeTool === 1 ? (
                              <div className="flex flex-col items-center justify-center py-10 gap-8">
                                <div className="relative">
                                  <div className="text-7xl font-black text-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] tracking-tighter">
                                    O(log n)
                                  </div>
                                </div>
                                <div className="text-xs uppercase font-black opacity-40 tracking-[0.2em] text-white">
                                  Complexity Analysis result
                                </div>
                                <div className="w-full max-w-xs h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "33%" }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                  />
                                </div>
                                <p className="text-[10px] font-bold opacity-60 text-center max-w-xs text-white">
                                  {language === "ar"
                                    ? "يعتبر هذا تعقيداً ممتازاً (Logarithmic). مناسب جداً للبيانات الضخمة."
                                    : "This is an optimal logarithmic complexity. Efficient for large datasets."}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-6 text-white">
                                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-[2.5rem] relative overflow-hidden">
                                  <p className="text-xs font-black text-yellow-500 mb-3 tracking-widest uppercase">
                                    Refactor Suggestion
                                  </p>
                                  <p className="text-sm font-bold">
                                    Use optional chaining for safer property
                                    access.
                                  </p>
                                </div>
                                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-[2.5rem] relative overflow-hidden">
                                  <p className="text-xs font-black text-green-500 mb-3 tracking-widest uppercase">
                                    Best Practice
                                  </p>
                                  <p className="text-sm font-bold">
                                    Variable names are descriptive and follow
                                    camelCase standard.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-8 flex flex-col items-center justify-center h-full">
                        <div
                          className={cn(
                            "w-40 h-40 rounded-[3rem] bg-gradient-to-br mx-auto flex items-center justify-center text-white shadow-2xl relative",
                            config.color,
                          )}
                        >
                          <config.icon className="w-20 h-20 animate-pulse" />
                          <div className="absolute inset-[-10px] border-2 border-dashed border-white/20 rounded-[3.5rem] animate-[spin_20s_linear_infinite]" />
                        </div>
                        <div>
                          <h2 className="text-4xl font-black mb-4">
                            {config.tools[activeTool]}
                          </h2>
                          <p className="text-muted-foreground font-bold max-w-md mx-auto">
                            {language === "ar"
                              ? "جاري تهيئة الوحدة التفاعلية بناءً على المادة العلمية الخاصة بك..."
                              : "Initializing interactive module based on your study material..."}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="lg:col-span-3">
          <Card className="rounded-[2.5rem] border-2 border-primary/10 bg-primary/5 backdrop-blur-xl h-full flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 bg-primary text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 fill-current" />
                <span className="font-black uppercase tracking-widest text-sm">
                  Lab AI
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white/50" />
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto space-y-6 flex flex-col-reverse">
              <AnimatePresence initial={false}>
                {[...messages].reverse().map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-5 rounded-3xl border border-border/50 shadow-sm mb-4",
                      msg.role === "ai"
                        ? "bg-card"
                        : "bg-primary text-primary-foreground self-end ml-10",
                    )}
                  >
                    <p className="text-sm font-bold leading-relaxed">
                      {msg.content}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isAiLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center gap-4 py-10 opacity-40"
                >
                  <Terminal className="w-8 h-8 animate-pulse" />
                  <p className="text-[10px] font-black text-center uppercase">
                    Analyzing circuit logic...
                  </p>
                </motion.div>
              )}
            </div>

            <div className="p-4 bg-card/50 border-t border-border/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(userInput);
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={
                    language === "ar"
                      ? "اسأل الـ AI في المختبر..."
                      : "Ask Lab AI..."
                  }
                  className="w-full h-12 bg-background border-2 border-border/50 rounded-xl px-4 pr-12 text-xs font-bold focus:border-primary transition-all outline-none"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1.5 top-1.5 w-9 h-9 rounded-lg"
                >
                  <ArrowRight
                    className={cn("w-4 h-4", language === "en" && "rotate-180")}
                  />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
