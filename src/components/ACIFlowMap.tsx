'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ACIMapNode from './ACIMapNode';

// ── Weeks ──────────────────────────────────────────────
const weeks = [
  { id: 1, title: 'Week 1', subtitle: 'ACI Plugs In',
    bullets: ['Connects to your existing tools — zero disruption', 'Maps your real org: who talks to who', 'CEO gets first report: "Here\'s what I see"'],
    outcomeStat: 'Org reality map', outcome: 'Your org chart says one thing. Reality says another. Now you know both.' },
  { id: 2, title: 'Week 2', subtitle: 'ACI Learns',
    bullets: ['Identifies bottlenecks where work stalls', 'Spots tool & work redundancy', 'Flags knowledge risk in key people'],
    outcomeStat: '$4,200/mo waste found', outcome: '23 hrs/week duplicated work. 46 hrs/week lost to bottlenecks.' },
  { id: 3, title: 'Week 3', subtitle: 'ACI Suggests',
    bullets: ['CEO gets prioritized recommendations', 'Nothing happens without your approval', 'Quick wins first — biggest ROI'],
    outcomeStat: '$8,400/mo approved', outcome: '3 quick wins approved. 34 hrs/week returned to revenue work.' },
  { id: 4, title: 'Week 4', subtitle: 'ACI Delivers',
    bullets: ['Custom automations deployed', 'Less friction, faster decisions', 'Knowledge preserved forever'],
    outcomeStat: '$14,000 saved', outcome: 'Team velocity up 40%. Zero disruption. ACI keeps compounding.' },
];

// ── Colors ─────────────────────────────────────────────
const C = {
  gold: '#38BDF8', green: '#38BDF8', red: '#ef4444', cyan: '#38BDF8',
  purple: '#818CF8', emerald: '#818CF8', blue: '#6366F1', orange: '#0EA5E9',
  pink: '#818CF8', teal: '#38BDF8',
};

// ── All Nodes (positioned) ─────────────────────────────
interface NDef {
  id: string; label: string; subtitle: string; detail: string;
  stat?: string; icon: string; color: string;
  nodeType: 'ceo' | 'brain' | 'tool' | 'problem' | 'suggestion' | 'solution';
  fixedWidth?: number; fixedHeight?: number; iconSrc?: string; week: number; x: number; y: number;
}

const allNodeDefs: NDef[] = [
  // CEO — centered under "30 Days" heading
  { id: 'aci', label: 'ACI', fixedHeight: 35, subtitle: 'Adaptive Compound Intelligence', detail: '', iconSrc: 'https://cdn.lordicon.com/wzrwaorf.json', icon: '', color: '#818CF8', nodeType: 'brain', week: 0, x: 320, y: 155 },
  { id: 'email', label: 'Email', subtitle: '', detail: '', icon: '', color: '#38BDF8', nodeType: 'tool', week: 1, x: -240, y: 250 },
  { id: 'messaging', label: 'Messaging', subtitle: '', detail: '', icon: '', color: '#38BDF8', nodeType: 'tool', week: 1, x: -50, y: 250 },
  { id: 'calendar', label: 'Calendar', subtitle: '', detail: '', icon: '', color: '#38BDF8', nodeType: 'tool', week: 1, x: 140, y: 250 },
  { id: 'projects', label: 'Projects', subtitle: '', detail: '', icon: '', color: '#38BDF8', nodeType: 'tool', week: 1, x: 330, y: 250 },
  { id: 'crm', label: 'CRM', subtitle: '', detail: '', icon: '', color: '#38BDF8', nodeType: 'tool', week: 1, x: 520, y: 250 },
  { id: 'docs', label: 'Documents', subtitle: '', detail: '', icon: '', color: '#38BDF8', nodeType: 'tool', week: 1, x: 710, y: 250 },
  { id: 'ceo', label: 'Owner / CEO', subtitle: 'You — always in control', detail: 'Every action confirmed with you first.', iconSrc: 'https://cdn.lordicon.com/hrjifpbq.json', icon: '', color: '#38BDF8', nodeType: 'ceo', week: 0, x: 320, y: 20 },
];

// ── All Edges ──────────────────────────────────────────
interface EDef { id: string; source: string; target: string; week: number; label?: string; checkpoint?: boolean; }

const allEdgeDefs: EDef[] = [
  { id: 'e-ceo-aci', source: 'ceo', target: 'aci', week: 0 },
  { id: 'e-aci-email', source: 'aci', target: 'email', week: 1 },
  { id: 'e-aci-messaging', source: 'aci', target: 'messaging', week: 1 },
  { id: 'e-aci-calendar', source: 'aci', target: 'calendar', week: 1 },
  { id: 'e-aci-projects', source: 'aci', target: 'projects', week: 1 },
  { id: 'e-aci-crm', source: 'aci', target: 'crm', week: 1 },
  { id: 'e-aci-docs', source: 'aci', target: 'docs', week: 1 },
];

// ── Custom node types ──────────────────────────────────
const nodeTypes: NodeTypes = { aciNode: ACIMapNode };

// ── Component ──────────────────────────────────────────
export default function ACIFlowMap() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [isPlaying, setIsPlaying] = useState(false);
  const [visBullets, setVisBullets] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bulletRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setExpandedWeeks(new Set([currentWeek]));
    setVisBullets(0);
    if (bulletRef.current) clearInterval(bulletRef.current);
    let c = 0;
    const max = weeks[currentWeek - 1].bullets.length;
    bulletRef.current = setInterval(() => { c++; setVisBullets(c); if (c >= max && bulletRef.current) clearInterval(bulletRef.current); }, 600);
    return () => { if (bulletRef.current) clearInterval(bulletRef.current); };
  }, [currentWeek]);

  const toggleWeek = (wk: number) => {
    setExpandedWeeks(prev => { const n = new Set(prev); if (n.has(wk)) n.delete(wk); else n.add(wk); return n; });
  };

  const playStory = useCallback(() => {
    setIsPlaying(true); setCurrentWeek(1);
    let wk = 1;
    timerRef.current = setInterval(() => {
      wk++; if (wk > 4) { if (timerRef.current) clearInterval(timerRef.current); setIsPlaying(false); return; }
      setCurrentWeek(wk);
    }, 7000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); if (bulletRef.current) clearInterval(bulletRef.current); }, []);

  // Build visible nodes & edges
  const nodes: Node[] = useMemo(() => {
    return allNodeDefs
      .filter(n => n.week <= currentWeek || n.week === 0)
      .map(n => ({
        id: n.id,
        type: 'aciNode',
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          subtitle: n.subtitle,
          detail: n.detail,
          stat: n.stat,
          icon: n.icon,
          iconSrc: n.iconSrc,
          fixedWidth: n.fixedWidth,
          fixedHeight: n.fixedHeight,
          color: n.color,
          nodeType: n.nodeType,
          showFixed: n.nodeType === 'problem' && currentWeek >= 4,
        },
      }));
  }, [currentWeek]);

  const edges: Edge[] = useMemo(() => {
    return allEdgeDefs
      .filter(e => e.week <= currentWeek)
      .map(e => {
        const isCEO = e.source === 'ceo' || e.target === 'ceo';
        const isCheckpoint = e.checkpoint;
        const color = isCEO || isCheckpoint ? C.gold : e.week === 2 ? C.red : e.week >= 3 ? C.emerald : '#10b981';
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: true,
          style: { stroke: color, strokeWidth: isCEO ? 2 : 1.2, opacity: 0.5 },
          labelStyle: { fill: `${color}`, fontSize: 9, fontWeight: 600 },
          labelBgStyle: { fill: '#0a0a0f', fillOpacity: 0.8 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
          markerEnd: { type: MarkerType.ArrowClosed, color, width: 12, height: 12 },
        };
      });
  }, [currentWeek]);

  const weekData = weeks[currentWeek - 1];

  // Auto-grow height based on lowest visible node + padding
  const mapHeight = useMemo(() => {
    const visibleNodes = allNodeDefs.filter(n => n.week <= currentWeek || n.week === 0);
    const maxY = Math.max(...visibleNodes.map(n => n.y));
    // Node height ~120px + 150px padding
    return Math.max(500, maxY + 270);
  }, [currentWeek]);

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4" style={{ height: mapHeight, minHeight: 500 }}>
      {/* ── Left Panel ── */}
      <div className="lg:w-[264px] flex-shrink-0 overflow-y-auto">
        <div className="space-y-1.5 mb-3">
          {weeks.map(wk => {
            const isCurrent = currentWeek === wk.id;
            const isPast = currentWeek > wk.id;
            const isExpanded = expandedWeeks.has(wk.id);
            return (
              <div key={wk.id} className={`rounded-lg border transition-all duration-500 ${
                isCurrent ? 'border-sky-400/30 bg-sky-400/5' :
                isPast ? 'border-white/8 bg-[#0D1225]/50' : 'border-white/5 opacity-30'
              }`}>
                <button onClick={() => {
                  if (isPast || isCurrent) { toggleWeek(wk.id); if (!isCurrent) { setCurrentWeek(wk.id); setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); } }
                }} className="w-full flex items-center justify-between px-2 py-1.5 text-left">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-sky-400 animate-pulse' : isPast ? 'bg-indigo-400' : 'bg-white/15'}`} />
                    <span className={`text-[9px] font-bold ${isCurrent ? 'text-sky-300' : isPast ? 'text-white/40' : 'text-white/20'}`}>
                      {wk.title}: {wk.subtitle}
                    </span>
                  </div>
                  {(isPast || isCurrent) && <span className={`text-[7px] ${isExpanded ? 'rotate-180' : ''} text-white/20 transition-transform`}>▼</span>}
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[250px]' : 'max-h-0'}`}>
                  <div className="px-2 pb-2">
                    <ul className="space-y-1 mb-1.5">
                      {wk.bullets.map((b, i) => (
                        <li key={i} className={`flex items-start gap-1 transition-all ${isCurrent && i < visBullets ? 'opacity-100' : isCurrent ? 'opacity-0' : 'opacity-60'}`}>
                          <span className="text-sky-400 text-[8px] mt-0.5">→</span>
                          <span className="text-white/50 text-[9px] leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`rounded px-1.5 py-1 text-[8px] ${
                      wk.id >= 3 ? 'bg-sky-400/10 border border-sky-400/15' :
                      wk.id === 2 ? 'bg-red-500/10 border border-red-400/15' : 'bg-white/5 border border-white/5'
                    }`}>
                      <div className={`font-bold ${wk.id >= 3 ? 'text-sky-400' : wk.id === 2 ? 'text-red-400' : 'text-white/40'}`}>{wk.outcomeStat}</div>
                      <div className="text-white/30 leading-snug">{wk.outcome}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={playStory} disabled={isPlaying}
          className={`w-full py-1.5 rounded-lg text-[9px] font-bold transition-all ${
            isPlaying ? 'bg-sky-400/10 text-sky-300/30 cursor-not-allowed'
            : 'bg-sky-400/10 text-sky-300 border border-sky-400/20 hover:bg-sky-400/20'
          }`}>
          {isPlaying ? '▶ Playing...' : '▶ Watch 30-Day Journey'}
        </button>

        <div className="mt-3 space-y-0.5 text-[7px]">
          {[
            ['#38BDF8', 'ACI System'], ['#818CF8', 'CEO / Approval'], [C.red, 'Problem Found'],
            [C.emerald, 'Solution Built'], ['#818CF8', '✋ Human-in-Loop'],
          ].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: c }}></div>
              <span className="text-white/25">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── React Flow Map ── */}
      <div className="flex-1 overflow-hidden bg-transparent">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          zoomOnPinch={false}
          preventScrolling={false}
        >
          
        </ReactFlow>
      </div>
    </div>
  );
}
