"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Search,
  ChevronRight,
  X,
  Sparkles,
  Brain,
  FileText,
  Layout,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpriteText from "three-spritetext";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

interface GalaxyData {
  nodes: any[];
  links: any[];
  title?: string;
  language?: string;
}

export default function GalaxyViewer({ data }: { data: GalaxyData }) {
  const router = useRouter();
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [focusNode, setFocusNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  // Study Mode State
  const [studyAction, setStudyAction] = useState<
    null | "quiz" | "summary" | "cards"
  >(null);
  const [studyData, setStudyData] = useState<any>(null);
  const [studyError, setStudyError] = useState<string | null>(null);
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nodeConnections = useMemo(() => {
    const connections = new Map();
    data.links.forEach((link) => {
      const source =
        typeof link.source === "object" ? link.source.id : link.source;
      const target =
        typeof link.target === "object" ? link.target.id : link.target;
      if (!connections.has(source)) connections.set(source, []);
      if (!connections.has(target)) connections.set(target, []);
      connections.get(source).push(target);
      connections.get(target).push(source);
    });
    return connections;
  }, [data]);

  const filteredNodes = useMemo(() => {
    return data.nodes
      .filter((n) => n.level > 0)
      .filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.level - b.level);
  }, [data.nodes, searchQuery]);

  useEffect(() => {
    if (fgRef.current && data && mounted) {
      fgRef.current.d3Force("charge").strength(-700);
      fgRef.current
        .d3Force("link")
        .distance((link: any) => {
          const sourceLevel = link.source.level || 0;
          if (sourceLevel === 0) return 300;
          if (sourceLevel === 1) return 200;
          return 140;
        })
        .iterations(3);
      fgRef.current.d3Force("center").strength(0.01);
      const d3 = require("d3-force-3d");
      fgRef.current.d3Force("collide", d3.forceCollide(70));
    }
  }, [data, mounted]);

  const handleStudyAction = async (action: "quiz" | "summary" | "cards") => {
    if (!focusNode || !focusNode.source_excerpt) {
      alert("Concept grounding data missing for this node.");
      return;
    }

    setStudyAction(action);
    setIsGeneratingStudy(true);
    setStudyData(null);
    setStudyError(null);

    try {
      const res = await fetch("/api/generate-concept-study", {
        method: "POST",
        body: JSON.stringify({
          concept: focusNode.name,
          excerpt: focusNode.source_excerpt,
          action: action,
          language: data.language || "ar",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.details || errData.error || `Server Error (${res.status})`,
        );
      }

      const resultData = await res.json();

      // Validation check
      if (
        action === "quiz" &&
        (!resultData.questions || resultData.questions.length === 0)
      )
        throw new Error("AI failed to generate questions.");
      if (
        action === "cards" &&
        (!resultData.cards || resultData.cards.length === 0)
      )
        throw new Error("AI failed to generate cards.");
      if (
        action === "summary" &&
        (!resultData.result || resultData.result.length < 10)
      )
        throw new Error("AI failed to generate a meaningful summary.");

      setStudyData(resultData);
    } catch (err: any) {
      console.error(err);
      setStudyError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGeneratingStudy(false);
    }
  };

  if (!mounted) return null;

  const handleNodeClick = (node: any) => {
    setFocusNode(node);
    fgRef.current.cameraPosition(
      { x: node.x + 100, y: node.y + 50, z: node.z + 120 },
      node,
      2000,
    );
  };

  const navigateToNode = (node: any) => {
    setFocusNode(node);
    fgRef.current.cameraPosition(
      { x: node.x + 100, y: node.y + 50, z: node.z + 120 },
      node,
      2000,
    );
  };

  return (
    <div className="relative w-full h-screen bg-[#010206] overflow-hidden font-sans text-white">
      {/* HUD - Left */}
      <div className="absolute top-10 left-10 z-[60] flex flex-col gap-6 max-w-sm pointer-events-none">
        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 text-white hover:bg-white/20 transition-all shadow-2xl"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 space-y-6 shadow-3xl pointer-events-auto">
          <div className="space-y-1">
            <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[10px]">
              Knowledge Galaxy
            </p>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
              {data.title || "Structure"}
            </h1>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <AnimatePresence mode="wait">
            {!focusNode && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium text-white/40 italic"
              >
                Orbiting the core material. Explore concepts to reveal details.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar - Right */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute top-0 right-0 h-full w-80 z-[60] bg-black/40 backdrop-blur-3xl border-l border-white/10 p-8 flex flex-col gap-8 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Index
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/40 hover:text-white"
                onClick={() => setShowSidebar(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input
                className="bg-white/5 border-white/10 pl-10 h-12 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-blue-500/50"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {filteredNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => navigateToNode(node)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all group ${
                    focusNode?.id === node.id
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <div className="text-left overflow-hidden">
                    <p
                      className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${
                        node.level === 1
                          ? "text-purple-400"
                          : "text-blue-400 opacity-60"
                      }`}
                    >
                      {node.level === 1 ? "Chapter" : "Concept"}
                    </p>
                    <p className="text-white font-bold truncate leading-tight">
                      {node.name}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      focusNode?.id === node.id
                        ? "text-blue-400"
                        : "text-white/20 group-hover:translate-x-1"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSidebar && (
        <Button
          className="absolute top-10 right-10 z-[60] w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 text-white hover:bg-white/20"
          onClick={() => setShowSidebar(true)}
        >
          <Search className="w-6 h-6" />
        </Button>
      )}

      {/* Detail Panel */}
      <AnimatePresence>
        {focusNode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-12 left-10 z-[60] w-full max-w-xl bg-gradient-to-br from-blue-900/60 to-indigo-900/60 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 shadow-3xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Level {focusNode.level}
                  </div>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter leading-none pr-10">
                  {focusNode.name}
                </h2>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2 text-left">
                    <Sparkles className="w-3 h-3" />
                    Discovery Insight
                  </p>
                  <p className="text-lg font-bold text-white/90 leading-relaxed text-left">
                    {focusNode.description ||
                      "The structure reveals its secrets through closer observation."}
                  </p>
                </div>

                {focusNode.source_excerpt && (
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.2em] flex items-center gap-2 text-left">
                      <ChevronRight className="w-3 h-3" />
                      Original Root
                    </p>
                    <p className="text-xs font-medium text-white/40 italic leading-relaxed text-left pl-4 border-l-2 border-white/10">
                      "{focusNode.source_excerpt}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleStudyAction("quiz")}
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all gap-2 group"
                >
                  <Brain className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    اختبرني
                  </span>
                </button>
                <button
                  onClick={() => handleStudyAction("summary")}
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all gap-2 group"
                >
                  <FileText className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                    تعمق
                  </span>
                </button>
                <button
                  onClick={() => handleStudyAction("cards")}
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all gap-2 group"
                >
                  <Layout className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    بطاقات
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between pointer-events-auto pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/20 hover:text-white/60 text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setFocusNode(null)}
                >
                  Dismiss Discovery
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                    Synapse Active
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Discovery Overlay */}
      <AnimatePresence>
        {studyAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-4xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    {studyAction === "quiz" && (
                      <Brain className="w-6 h-6 text-blue-400" />
                    )}
                    {studyAction === "summary" && (
                      <FileText className="w-6 h-6 text-purple-400" />
                    )}
                    {studyAction === "cards" && (
                      <Layout className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white tracking-tight">
                      {studyAction === "quiz" && "Rapid Synapse Check"}
                      {studyAction === "summary" && "Concept Deep Dive"}
                      {studyAction === "cards" && "Flash Memory Cells"}
                    </h4>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none mt-1">
                      Focused on: {focusNode?.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/5 h-12 w-12"
                  onClick={() => {
                    setStudyAction(null);
                    setStudyData(null);
                  }}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="min-h-[300px] flex flex-col items-center justify-center">
                {isGeneratingStudy ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-t-2 border-blue-500 animate-spin" />
                    <p className="text-lg font-bold text-white/60 animate-pulse tracking-widest uppercase text-center">
                      AI Architecting Study Session...
                    </p>
                  </div>
                ) : studyError ? (
                  <div className="flex flex-col items-center gap-6 bg-red-500/10 border border-red-500/20 p-10 rounded-3xl w-full">
                    <Info className="w-12 h-12 text-red-400" />
                    <div className="text-center space-y-2">
                      <p className="text-xl font-bold text-white">
                        Oops! Connection Issue
                      </p>
                      <p className="text-sm text-white/40">{studyError}</p>
                    </div>
                    <Button
                      onClick={() => handleStudyAction(studyAction!)}
                      className="bg-red-500 hover:bg-red-600 font-bold px-10 rounded-2xl"
                    >
                      Retry Discovery
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-6">
                    {studyAction === "summary" && studyData?.result && (
                      <div className="bg-white/5 rounded-3xl p-8 border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <p className="text-xl font-medium text-white/90 leading-relaxed whitespace-pre-line text-right">
                          {studyData.result}
                        </p>
                      </div>
                    )}

                    {!studyData && !studyError && !isGeneratingStudy && (
                      <div className="text-center py-10">
                        <p className="text-white/20 italic">
                          No data returned by AI architect.
                        </p>
                      </div>
                    )}

                    {studyAction === "quiz" && studyData?.questions && (
                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                        {studyData.questions.map((q: any, i: number) => (
                          <div
                            key={i}
                            className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4"
                          >
                            <p className="text-lg font-bold text-white text-right">
                              <span className="text-blue-400 mr-2">
                                Q{i + 1}.
                              </span>{" "}
                              {q.question}
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {q.options.map((opt: string, j: number) => (
                                <div
                                  key={j}
                                  className={`p-4 rounded-xl border text-right transition-all font-bold ${
                                    opt === q.answer
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                      : "bg-white/5 border-white/5 text-white/40"
                                  }`}
                                >
                                  {opt}
                                  {opt === q.answer && (
                                    <CheckCircle2 className="w-4 h-4 inline ml-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {studyAction === "cards" && studyData?.cards && (
                      <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {studyData.cards.map((c: any, i: number) => (
                          <div key={i} className="flex gap-4 group">
                            <div className="flex-1 bg-white/5 rounded-2xl p-6 border border-white/5 text-right">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                                Front
                              </p>
                              <p className="text-white font-bold">{c.front}</p>
                            </div>
                            <div className="flex-1 bg-blue-500/10 rounded-2xl p-6 border border-blue-500/10 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                                Back (Peek)
                              </p>
                              <p className="text-white font-bold">{c.back}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        backgroundColor="#010206"
        onNodeClick={handleNodeClick}
        onNodeHover={setHoverNode}
        nodeThreeObject={(node: any) => {
          const isFocused = focusNode
            ? focusNode.id === node.id ||
              nodeConnections.get(focusNode.id)?.includes(node.id)
            : true;
          const isSelected = focusNode?.id === node.id;
          const isHovered = hoverNode === node;

          const group = new THREE.Group();

          const sphereSize = (node.val || 6) * (isSelected ? 1.5 : 1);
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(sphereSize, 32, 32),
            new THREE.MeshPhongMaterial({
              color: node.color || "#ffffff",
              emissive: node.color || "#ffffff",
              emissiveIntensity: isFocused ? 0.9 : 0.05,
              transparent: true,
              opacity: isFocused ? 1 : 0.1,
            }),
          );
          group.add(sphere);

          if (isSelected) {
            const ringGeo = new THREE.RingGeometry(
              sphereSize + 4,
              sphereSize + 5,
              64,
            );
            const ringMat = new THREE.MeshBasicMaterial({
              color: "#60a5fa",
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.5,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.lookAt(new THREE.Vector3(0, 0, 1));
            group.add(ring);
          }

          const sprite = new SpriteText(node.name);
          sprite.color = node.color || "#ffffff";
          sprite.textHeight =
            (node.val ? node.val / 2 + 3 : 5) *
            (isHovered || isSelected ? 2 : 1);
          sprite.padding = 4;
          sprite.backgroundColor =
            isHovered || isSelected ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)";
          sprite.borderRadius = 12;
          // @ts-ignore
          sprite.position.y = sphereSize + 15;
          // @ts-ignore
          sprite.visible = isFocused || isHovered || isSelected;
          group.add(sprite);

          return group;
        }}
        linkOpacity={0.4}
        linkColor={(link: any) => {
          if (!focusNode) return "rgba(255,255,255,0.6)";
          const s =
            typeof link.source === "object" ? link.source.id : link.source;
          const t =
            typeof link.target === "object" ? link.target.id : link.target;
          return s === focusNode.id || t === focusNode.id
            ? "#60a5fa"
            : "rgba(255,255,255,0.15)";
        }}
        linkWidth={(link: any) => {
          if (!focusNode) return 0.8;
          const s =
            typeof link.source === "object" ? link.source.id : link.source;
          const t =
            typeof link.target === "object" ? link.target.id : link.target;
          return s === focusNode.id || t === focusNode.id ? 4 : 0.6;
        }}
        linkDirectionalParticles={(link: any) => {
          if (!focusNode) return 0;
          const s =
            typeof link.source === "object" ? link.source.id : link.source;
          const t =
            typeof link.target === "object" ? link.target.id : link.target;
          return s === focusNode.id || t === focusNode.id ? 10 : 0;
        }}
        linkDirectionalParticleSpeed={0.015}
        linkDirectionalParticleWidth={2}
        enableNodeDrag={false}
        showNavInfo={false}
      />

      {/* Control HUD (Fixed) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-6 bg-white/5 backdrop-blur-3xl border border-white/10 px-10 py-6 rounded-[3rem] shadow-3xl pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-2xl w-12 h-12"
          onClick={() => {
            if (!fgRef.current) return;
            fgRef.current.zoomToFit(1200);
            setFocusNode(null);
          }}
        >
          <Maximize className="w-6 h-6" />
        </Button>
        <div className="w-px h-8 bg-white/10" />
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-2xl w-12 h-12"
          onClick={() => {
            if (!fgRef.current) return;
            const pos = fgRef.current.cameraPosition();
            const factor = 0.6;
            fgRef.current.cameraPosition(
              { x: pos.x * factor, y: pos.y * factor, z: pos.z * factor },
              null,
              1000,
            );
          }}
        >
          <ZoomIn className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-2xl w-12 h-12"
          onClick={() => {
            if (!fgRef.current) return;
            const pos = fgRef.current.cameraPosition();
            const factor = 1.4;
            fgRef.current.cameraPosition(
              { x: pos.x * factor, y: pos.y * factor, z: pos.z * factor },
              null,
              1000,
            );
          }}
        >
          <ZoomOut className="w-6 h-6" />
        </Button>
        <div className="w-px h-8 bg-white/10" />
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-2xl w-12 h-12"
          onClick={() => {
            if (!fgRef.current) return;
            fgRef.current.cameraPosition(
              { x: 0, y: 0, z: 500 },
              { x: 0, y: 0, z: 0 },
              2000,
            );
            setFocusNode(null);
          }}
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
