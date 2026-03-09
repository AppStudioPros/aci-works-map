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
  gold: '#e09f18', green: '#10b981', red: '#ef4444', cyan: '#06b6d4',
  purple: '#a855f7', emerald: '#34d399', blue: '#3b82f6', orange: '#f97316',
  pink: '#ec4899', teal: '#14b8a6',
};

// ── All Nodes (positioned) ─────────────────────────────
interface NDef {
  id: string; label: string; subtitle: string; detail: string;
  stat?: string; icon: string; color: string;
  nodeType: 'ceo' | 'brain' | 'tool' | 'problem' | 'suggestion' | 'solution';
  week: number; x: number; y: number;
}

const allNodeDefs: NDef[] = [
  // Anchors — top center
  { id: 'ceo', label: 'CEO', subtitle: 'You — always in control', detail: 'Every action confirmed with you first.', icon: '👔', color: C.gold, nodeType: 'ceo', week: 0, x: 400, y: 0 },
  { id: 'aci', label: 'ACI Brain', subtitle: 'Adaptive Compound Intelligence', detail: 'Learns, connects, builds — smarter every day.', icon: '🧠', color: C.emerald, nodeType: 'brain', week: 0, x: 400, y: 160 },

  // Week 1: Tools — spread around the brain
  { id: 'email', label: 'Email', subtitle: 'Communications', detail: 'Who talks to who, decision chains.', stat: '● Connected', icon: '📧', color: C.green, nodeType: 'tool', week: 1, x: 50, y: 100 },
  { id: 'slack', label: 'Messaging', subtitle: 'Slack / Teams', detail: 'Where real decisions happen.', stat: '● Connected', icon: '💬', color: C.cyan, nodeType: 'tool', week: 1, x: 750, y: 100 },
  { id: 'calendar', label: 'Calendar', subtitle: 'Scheduling', detail: 'Meeting patterns, time allocation.', stat: '● Connected', icon: '📅', color: C.blue, nodeType: 'tool', week: 1, x: 750, y: 280 },
  { id: 'docs', label: 'Documents', subtitle: 'Files & Reports', detail: 'Who creates, who reads, what\'s stale.', stat: '● Connected', icon: '📄', color: C.purple, nodeType: 'tool', week: 1, x: 50, y: 280 },
  { id: 'crm', label: 'CRM', subtitle: 'Sales & Pipeline', detail: 'Deal patterns, pipeline health.', stat: '● Connected', icon: '🤝', color: C.orange, nodeType: 'tool', week: 1, x: 50, y: 450 },
  { id: 'projects', label: 'Projects', subtitle: 'Task Management', detail: 'Task flow, blocked work.', stat: '● Connected', icon: '📋', color: C.teal, nodeType: 'tool', week: 1, x: 400, y: 380 },
  { id: 'hr', label: 'HR Systems', subtitle: 'People & Culture', detail: 'Team structure, flight risks.', stat: '● Connected', icon: '👥', color: C.pink, nodeType: 'tool', week: 1, x: 750, y: 450 },
  { id: 'analytics', label: 'Analytics', subtitle: 'Metrics & KPIs', detail: 'Trends tied to work patterns.', stat: '● Connected', icon: '📊', color: C.blue, nodeType: 'tool', week: 1, x: 200, y: 450 },
  { id: 'security', label: 'Security', subtitle: 'Compliance', detail: 'Access anomalies, compliance.', stat: '● Connected', icon: '🔒', color: C.red, nodeType: 'tool', week: 1, x: 600, y: 450 },

  // Week 2: Problems
  { id: 'bottleneck', label: 'Bottlenecks', subtitle: '3 critical found', detail: 'Approval chains: 2-day avg delays.', stat: '⏱ 46 hrs/week lost', icon: '🚧', color: C.red, nodeType: 'problem', week: 2, x: 150, y: 580 },
  { id: 'redundancy', label: 'Redundancy', subtitle: '4 tools overlap', detail: '3 teams, same report, different tools.', stat: '💸 $4,200/mo wasted', icon: '♻️', color: C.red, nodeType: 'problem', week: 2, x: 400, y: 560 },
  { id: 'risk', label: 'Knowledge Risk', subtitle: '2 key people', detail: '40% institutional knowledge at risk.', stat: '⚠️ Critical', icon: '⚠️', color: C.red, nodeType: 'problem', week: 2, x: 650, y: 580 },

  // Week 3: Suggestions
  { id: 'qw1', label: 'Quick Win #1', subtitle: 'Cut Meetings', detail: 'Replace 3 meetings with async.', stat: '✋ Approved · 12 hrs/wk', icon: '💡', color: C.gold, nodeType: 'suggestion', week: 3, x: 150, y: 720 },
  { id: 'qw2', label: 'Quick Win #2', subtitle: 'Consolidate Tools', detail: 'One dashboard, 4 tools gone.', stat: '✋ Approved · $2,100/mo', icon: '💡', color: C.gold, nodeType: 'suggestion', week: 3, x: 400, y: 700 },
  { id: 'qw3', label: 'Quick Win #3', subtitle: 'Knowledge Capture', detail: 'Auto-capture tribal knowledge.', stat: '✋ Approved · Risk gone', icon: '💡', color: C.gold, nodeType: 'suggestion', week: 3, x: 650, y: 720 },

  // Week 4: Solutions
  { id: 'sol1', label: 'Smart Workflow', subtitle: 'Custom Built', detail: '2-day delays → instant.', stat: '✅ 46 hrs/week saved', icon: '⚙️', color: C.emerald, nodeType: 'solution', week: 4, x: 150, y: 860 },
  { id: 'sol2', label: 'Unified Dashboard', subtitle: 'Custom Built', detail: 'One view replaces 4 tools.', stat: '✅ $4,200/mo saved', icon: '📈', color: C.emerald, nodeType: 'solution', week: 4, x: 400, y: 840 },
  { id: 'sol3', label: 'Knowledge Vault', subtitle: 'Custom Built', detail: 'Zero single points of failure.', stat: '✅ Risk eliminated', icon: '🏦', color: C.emerald, nodeType: 'solution', week: 4, x: 650, y: 860 },
];

// ── All Edges ──────────────────────────────────────────
interface EDef { id: string; source: string; target: string; week: number; label?: string; checkpoint?: boolean; }

const allEdgeDefs: EDef[] = [
  { id: 'e-ceo-aci', source: 'ceo', target: 'aci', week: 0, label: 'controls' },
  // Tools → ACI
  ...['email','slack','calendar','docs','crm','projects','hr','analytics','security'].map(t => (
    { id: `e-aci-${t}`, source: 'aci', target: t, week: 1, label: 'data' }
  )),
  // Problems
  { id: 'e-aci-bn', source: 'aci', target: 'bottleneck', week: 2, label: 'detected' },
  { id: 'e-aci-rd', source: 'aci', target: 'redundancy', week: 2, label: 'detected' },
  { id: 'e-aci-rk', source: 'aci', target: 'risk', week: 2, label: 'detected' },
  { id: 'e-em-bn', source: 'email', target: 'bottleneck', week: 2 },
  { id: 'e-pj-bn', source: 'projects', target: 'bottleneck', week: 2 },
  { id: 'e-an-rd', source: 'analytics', target: 'redundancy', week: 2 },
  { id: 'e-dc-rd', source: 'docs', target: 'redundancy', week: 2 },
  { id: 'e-hr-rk', source: 'hr', target: 'risk', week: 2 },
  // Suggestions
  { id: 'e-bn-q1', source: 'bottleneck', target: 'qw1', week: 3 },
  { id: 'e-rd-q2', source: 'redundancy', target: 'qw2', week: 3 },
  { id: 'e-rk-q3', source: 'risk', target: 'qw3', week: 3 },
  { id: 'e-aci-q1', source: 'aci', target: 'qw1', week: 3, label: 'suggests', checkpoint: true },
  { id: 'e-aci-q2', source: 'aci', target: 'qw2', week: 3, label: 'suggests', checkpoint: true },
  { id: 'e-aci-q3', source: 'aci', target: 'qw3', week: 3, label: 'suggests', checkpoint: true },
  // Solutions
  { id: 'e-q1-s1', source: 'qw1', target: 'sol1', week: 4, label: 'builds' },
  { id: 'e-q2-s2', source: 'qw2', target: 'sol2', week: 4, label: 'builds' },
  { id: 'e-q3-s3', source: 'qw3', target: 'sol3', week: 4, label: 'builds' },
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
                isCurrent ? 'border-emerald-500/30 bg-emerald-500/5' :
                isPast ? 'border-white/8 bg-white/[0.01]' : 'border-white/5 opacity-30'
              }`}>
                <button onClick={() => {
                  if (isPast || isCurrent) { toggleWeek(wk.id); if (!isCurrent) { setCurrentWeek(wk.id); setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); } }
                }} className="w-full flex items-center justify-between px-2 py-1.5 text-left">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-emerald-400 animate-pulse' : isPast ? 'bg-emerald-600' : 'bg-white/15'}`} />
                    <span className={`text-[9px] font-bold ${isCurrent ? 'text-emerald-300' : isPast ? 'text-white/40' : 'text-white/20'}`}>
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
                          <span className="text-emerald-400 text-[8px] mt-0.5">→</span>
                          <span className="text-white/50 text-[9px] leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`rounded px-1.5 py-1 text-[8px] ${
                      wk.id >= 3 ? 'bg-emerald-500/10 border border-emerald-400/15' :
                      wk.id === 2 ? 'bg-red-500/10 border border-red-400/15' : 'bg-white/5 border border-white/5'
                    }`}>
                      <div className={`font-bold ${wk.id >= 3 ? 'text-emerald-400' : wk.id === 2 ? 'text-red-400' : 'text-white/40'}`}>{wk.outcomeStat}</div>
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
            isPlaying ? 'bg-emerald-500/10 text-emerald-300/30 cursor-not-allowed'
            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
          }`}>
          {isPlaying ? '▶ Playing...' : '▶ Watch 30-Day Journey'}
        </button>

        <div className="mt-3 space-y-0.5 text-[7px]">
          {[
            [C.emerald, 'ACI System'], [C.gold, 'CEO / Approval'], [C.red, 'Problem Found'],
            [C.emerald, 'Solution Built'], [C.gold, '✋ Human-in-Loop'],
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
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
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
