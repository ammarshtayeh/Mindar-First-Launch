"use client"

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// --- LAYOUT LOGIC ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

// --- COMPONENT ---

export default function MindMapPage() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Mind Map");

  useEffect(() => {
    const storedData = localStorage.getItem('currentMindMap');
    if (!storedData) {
        setLoading(false);
        return;
    }

    try {
        const data = JSON.parse(storedData);
        setTitle(data.title || 'Mind Map');

        // Convert hierarchical JSON to flat Nodes/Edges
        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];
        
        const traverse = (node: any, parentId?: string, level: number = 0, branchIndex: number = 0) => {
            const id = node.id || `node-${Math.random().toString(36).substr(2, 9)}`;

            const colorPalettes = [
                { bg: 'from-blue-500 to-indigo-600', stroke: '#3b82f6', light: '#dbeafe' },
                { bg: 'from-purple-500 to-fuchsia-600', stroke: '#a855f7', light: '#f3e8ff' },
                { bg: 'from-rose-500 to-pink-600', stroke: '#f43f5e', light: '#ffe4e6' },
                { bg: 'from-amber-500 to-orange-600', stroke: '#f59e0b', light: '#fef3c7' },
                { bg: 'from-emerald-500 to-teal-600', stroke: '#10b981', light: '#d1fae5' },
                { bg: 'from-cyan-500 to-blue-600', stroke: '#06b6d4', light: '#cffafe' },
            ];

            const palette = level === 0 ? { bg: 'from-slate-800 to-slate-900', stroke: '#1e293b', light: '#f1f5f9' } : colorPalettes[branchIndex % colorPalettes.length];

            const isRoot = level === 0;
            
            initialNodes.push({
                id,
                data: { label: node.label },
                position: { x: 0, y: 0 }, 
                type: isRoot ? 'input' : 'default', 
                style: {
                    background: isRoot 
                        ? `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)` 
                        : level === 1 
                            ? `linear-gradient(135deg, ${palette.stroke} 0%, ${palette.stroke}dd 100%)`
                            : 'rgba(255, 255, 255, 0.9)',
                    color: (isRoot || level === 1) ? 'white' : '#1e293b',
                    border: `2px solid ${palette.stroke}`,
                    borderRadius: '1.25rem',
                    padding: isRoot ? '16px 32px' : '10px 20px',
                    boxShadow: isRoot 
                        ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' 
                        : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontWeight: isRoot ? '800' : '600',
                    fontSize: isRoot ? '18px' : level === 1 ? '15px' : '13px',
                    width: nodeWidth,
                    textAlign: 'center',
                    backdropFilter: 'blur(8px)',
                }
            });

            if (parentId) {
                initialEdges.push({
                    id: `e${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    animated: level < 3,
                    style: { stroke: palette.stroke, strokeWidth: level === 1 ? 3 : 2, opacity: 0.6 },
                    type: 'smoothstep'
                });
            }

            if (node.children && Array.isArray(node.children)) {
                node.children.forEach((child: any, idx: number) => {
                    const nextBranch = level === 0 ? idx : branchIndex;
                    traverse(child, id, level + 1, nextBranch);
                });
            }
        };

        if (data.root) {
            traverse(data.root);
            const layouted = getLayoutedElements(initialNodes, initialEdges);
            setNodes(layouted.nodes);
            setEdges(layouted.edges);
        }

    } catch (e) {
        console.error("Failed to parse mind map data", e);
    } finally {
        setLoading(false);
    }
  }, []);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center bg-background space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse font-medium">جاري رسم خريطتك الذهنية...</p>
    </div>
  );

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden"
    >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border z-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">
                         {title}
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mind Map Viewer</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 rounded-full">
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>
                <Button size="sm" className="flex items-center gap-2 rounded-full shadow-lg shadow-primary/20">
                    <Download className="w-4 h-4" />
                    Export Image
                </Button>
            </div>
        </div>

      <div className="flex-1 w-full relative">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="selection:bg-primary/20"
        >
            <Controls className="bg-background border-border shadow-xl rounded-lg overflow-hidden" />
            <MiniMap 
                className="bg-background/80 backdrop-blur-sm border-border rounded-xl shadow-2xl" 
                nodeColor={(n) => {
                    if (n.type === 'input') return '#1e293b';
                    return '#e2e8f0';
                }}
            />
            <Background gap={20} size={1} variant={BackgroundVariant.Dots} color="#94a3b8" />
        </ReactFlow>
      </div>
    </motion.div>
  );
}
