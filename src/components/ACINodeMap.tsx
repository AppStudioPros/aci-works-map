'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Week Data ──────────────────────────────────────────
const weeks = [
  {
    id: 1,
    title: 'Week 1',
    subtitle: 'ACI Plugs In',
    bullets: [
      'Connects to your existing tools — zero disruption',
      'Maps your real org: who talks to who, how decisions flow',
      'CEO gets first report: "Here\'s what I see"',
    ],
    outcome: 'Org reality map delivered',
    outcomeStat: 'Complete org mapping',
  },
  {
    id: 2,
    title: 'Week 2',
    subtitle: 'ACI Learns',
    bullets: [
      'Identifies bottlenecks where work stalls',
      'Spots redundancy: duplicate tools & duplicate work',
      'Flags risk: knowledge trapped in key people',
    ],
    outcome: '$4,200/mo in waste identified. 23 hrs/week duplicated work found.',
    outcomeStat: '$4,200/mo waste found',
  },
  {
    id: 3,
    title: 'Week 3',
    subtitle: 'ACI Suggests',
    bullets: [
      'CEO gets prioritized recommendations',
      'Human-in-the-loop: nothing happens without approval',
      'Quick wins first — biggest ROI, lowest disruption',
    ],
    outcome: '3 quick wins approved. $8,400/mo in savings greenlit.',
    outcomeStat: '$8,400/mo savings approved',
  },
  {
    id: 4,
    title: 'Week 4',
    subtitle: 'ACI Delivers',
    bullets: [
      'Custom automations deployed — built for YOUR company',
      'Team feels it: less friction, faster decisions',
      'Knowledge preserved — no single point of failure',
    ],
    outcome: 'First month ROI: $14,000 saved. Team velocity up 40%.',
    outcomeStat: '$14,000 saved in 30 days',
  },
];

// ── Node Data ──────────────────────────────────────────
interface NodeDef {
  id: string;
  label: string;
  subtitle: string;
  detail: string;
  stat?: string;
  icon: string;
  ring: 'ceo' | 'brain' | 'inner' | 'outer';
  week: number;
  status?: 'neutral' | 'problem' | 'fixed' | 'suggestion';
  // Grid position (col, row) for structured layout
  col: number;
  row: number;
}

const nodeDefs: NodeDef[] = [
  // Row 0: CEO
  { id: 'ceo', label: 'CEO', subtitle: 'You', detail: 'Every action approved by you. Always in control.', icon: '👔', ring: 'ceo', week: 1, col: 3, row: 0 },

  // Row 1: ACI Brain
  { id: 'aci', label: 'ACI Brain', subtitle: 'Adaptive Compound Intelligence', detail: 'Learns, connects, and builds — gets smarter every day.', icon: '🧠', ring: 'brain', week: 1, col: 3, row: 1 },

  // Row 2: Outer tools (Week 1)
  { id: 'email', label: 'Email', subtitle: 'Communications', detail: 'Learns who talks to who, response patterns, decision chains.', stat: 'Auto-connected', icon: '📧', ring: 'outer', week: 1, col: 0, row: 2 },
  { id: 'slack', label: 'Messaging', subtitle: 'Slack / Teams', detail: 'Where real decisions happen — not in meetings.', stat: 'Auto-connected', icon: '💬', ring: 'outer', week: 1, col: 1, row: 2 },
  { id: 'calendar', label: 'Calendar', subtitle: 'Scheduling', detail: 'Meeting patterns, time allocation, scheduling bottlenecks.', stat: 'Auto-connected', icon: '📅', ring: 'outer', week: 1, col: 2, row: 2 },
  { id: 'docs', label: 'Documents', subtitle: 'Files & Reports', detail: 'Every doc, spreadsheet, report — who creates, who reads.', stat: 'Auto-connected', icon: '📄', ring: 'outer', week: 1, col: 4, row: 2 },
  { id: 'crm', label: 'CRM', subtitle: 'Sales & Clients', detail: 'Pipeline patterns, deal velocity, relationship health.', stat: 'Auto-connected', icon: '🤝', ring: 'outer', week: 1, col: 5, row: 2 },
  { id: 'projects', label: 'Projects', subtitle: 'Task Management', detail: 'Task flow, blocked work, cross-team dependencies.', stat: 'Auto-connected', icon: '📋', ring: 'outer', week: 1, col: 6, row: 2 },

  // Row 3: More tools
  { id: 'hr', label: 'HR Systems', subtitle: 'People & Culture', detail: 'Team structure, onboarding gaps, flight risks.', stat: 'Auto-connected', icon: '👥', ring: 'outer', week: 1, col: 1, row: 3 },
  { id: 'analytics', label: 'Analytics', subtitle: 'Metrics & KPIs', detail: 'Business metrics, trends, insights surfaced proactively.', stat: 'Auto-connected', icon: '📊', ring: 'outer', week: 1, col: 3, row: 3 },
  { id: 'security', label: 'Security', subtitle: 'Compliance', detail: 'Threat monitoring, access anomalies, compliance tracking.', stat: 'Auto-connected', icon: '🔒', ring: 'outer', week: 1, col: 5, row: 3 },

  // Row 4: Week 2 — Problems found
  { id: 'bottleneck', label: 'Bottlenecks', subtitle: '3 critical found', detail: 'Approval chains causing 2-day delays on average.', stat: '⏱ 46 hrs/week lost', icon: '🚧', ring: 'inner', week: 2, col: 1, row: 4, status: 'problem' },
  { id: 'redundancy', label: 'Redundancy', subtitle: '4 tools overlap', detail: '3 teams building the same report. 4 tools doing the same job.', stat: '💸 $4,200/mo wasted', icon: '♻️', ring: 'inner', week: 2, col: 3, row: 4, status: 'problem' },
  { id: 'risk', label: 'Knowledge Risk', subtitle: '2 key people', detail: 'If these people leave, 40% of institutional knowledge goes.', stat: '⚠️ High flight risk', icon: '⚠️', ring: 'inner', week: 2, col: 5, row: 4, status: 'problem' },

  // Row 5: Week 3 — Suggestions
  { id: 'quickwin1', label: 'Quick Win #1', subtitle: 'CEO Approved ✓', detail: 'Eliminate redundant status meetings → saves 12 hrs/week.', stat: '✋ Approved', icon: '💡', ring: 'inner', week: 3, col: 1, row: 5, status: 'suggestion' },
  { id: 'quickwin2', label: 'Quick Win #2', subtitle: 'CEO Approved ✓', detail: 'Consolidate reporting tools → saves $2,100/mo.', stat: '✋ Approved', icon: '💡', ring: 'inner', week: 3, col: 3, row: 5, status: 'suggestion' },
  { id: 'quickwin3', label: 'Quick Win #3', subtitle: 'CEO Approved ✓', detail: 'Auto-capture tribal knowledge → eliminate risk.', stat: '✋ Approved', icon: '💡', ring: 'inner', week: 3, col: 5, row: 5, status: 'suggestion' },

  // Row 6: Week 4 — Solutions
  { id: 'custom1', label: 'Smart Workflow', subtitle: 'Custom Built', detail: 'Automated approval routing — 2-day delays eliminated.', stat: '✅ 46 hrs/week saved', icon: '⚙️', ring: 'inner', week: 4, col: 1, row: 6, status: 'fixed' },
  { id: 'custom2', label: 'Unified Dashboard', subtitle: 'Custom Built', detail: 'One dashboard replaces 4 tools. Auto-generated, always current.', stat: '✅ $4,200/mo saved', icon: '📈', ring: 'inner', week: 4, col: 3, row: 6, status: 'fixed' },
  { id: 'custom3', label: 'Knowledge Vault', subtitle: 'Custom Built', detail: 'Institutional knowledge preserved. No single point of failure.', stat: '✅ Risk eliminated', icon: '🏦', ring: 'inner', week: 4, col: 5, row: 6, status: 'fixed' },
];

interface ConnDef {
  from: string;
  to: string;
  week: number;
  checkpoint?: boolean;
}

const connDefs: ConnDef[] = [
  { from: 'ceo', to: 'aci', week: 1 },
  // ACI to tools
  { from: 'aci', to: 'email', week: 1 }, { from: 'aci', to: 'slack', week: 1 },
  { from: 'aci', to: 'calendar', week: 1 }, { from: 'aci', to: 'docs', week: 1 },
  { from: 'aci', to: 'crm', week: 1 }, { from: 'aci', to: 'projects', week: 1 },
  { from: 'aci', to: 'hr', week: 1 }, { from: 'aci', to: 'analytics', week: 1 },
  { from: 'aci', to: 'security', week: 1 },
  // Problems
  { from: 'aci', to: 'bottleneck', week: 2 }, { from: 'aci', to: 'redundancy', week: 2 }, { from: 'aci', to: 'risk', week: 2 },
  { from: 'email', to: 'bottleneck', week: 2 }, { from: 'projects', to: 'bottleneck', week: 2 },
  { from: 'analytics', to: 'redundancy', week: 2 }, { from: 'docs', to: 'redundancy', week: 2 },
  { from: 'hr', to: 'risk', week: 2 },
  // Suggestions → CEO approves
  { from: 'aci', to: 'quickwin1', week: 3, checkpoint: true },
  { from: 'aci', to: 'quickwin2', week: 3, checkpoint: true },
  { from: 'aci', to: 'quickwin3', week: 3, checkpoint: true },
  { from: 'bottleneck', to: 'quickwin1', week: 3 },
  { from: 'redundancy', to: 'quickwin2', week: 3 },
  { from: 'risk', to: 'quickwin3', week: 3 },
  // Solutions
  { from: 'quickwin1', to: 'custom1', week: 4 },
  { from: 'quickwin2', to: 'custom2', week: 4 },
  { from: 'quickwin3', to: 'custom3', week: 4 },
  { from: 'aci', to: 'custom1', week: 4 },
  { from: 'aci', to: 'custom2', week: 4 },
  { from: 'aci', to: 'custom3', week: 4 },
];

// ── Grid Layout ────────────────────────────────────────
function calcPositions(mapW: number, mapH: number) {
  const pos = new Map<string, { x: number; y: number }>();
  const colCount = 7;
  const rowCount = 7;
  const padX = mapW * 0.06;
  const padY = mapH * 0.04;
  const cellW = (mapW - padX * 2) / colCount;
  const cellH = (mapH - padY * 2) / rowCount;

  nodeDefs.forEach(n => {
    pos.set(n.id, {
      x: padX + n.col * cellW + cellW / 2,
      y: padY + n.row * cellH + cellH / 2,
    });
  });
  return { pos, cellW, cellH };
}

// ── Component ──────────────────────────────────────────
export default function ACINodeMap() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleBullets, setVisibleBullets] = useState(0);
  const [mapDims, setMapDims] = useState({ w: 750, h: 700 });
  const mapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bulletRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      if (mapRef.current) {
        const w = mapRef.current.offsetWidth;
        setMapDims({ w, h: w * 0.92 });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Auto-collapse: when week changes, only current week expanded
  useEffect(() => {
    setExpandedWeeks(new Set([currentWeek]));
    setVisibleBullets(0);
    if (bulletRef.current) clearInterval(bulletRef.current);
    let count = 0;
    const max = weeks[currentWeek - 1].bullets.length;
    bulletRef.current = setInterval(() => {
      count++;
      setVisibleBullets(count);
      if (count >= max && bulletRef.current) clearInterval(bulletRef.current);
    }, 600);
    return () => { if (bulletRef.current) clearInterval(bulletRef.current); };
  }, [currentWeek]);

  const toggleWeek = (wk: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(wk)) next.delete(wk); else next.add(wk);
      return next;
    });
  };

  const playStory = useCallback(() => {
    setIsPlaying(true);
    setCurrentWeek(1);
    let week = 1;
    timerRef.current = setInterval(() => {
      week++;
      if (week > 4) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
        return;
      }
      setCurrentWeek(week);
    }, 7000);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (bulletRef.current) clearInterval(bulletRef.current);
  }, []);

  const { w, h } = mapDims;
  const { pos, cellW, cellH } = calcPositions(w, h);

  const visNodes = nodeDefs.filter(n => n.week <= currentWeek);
  const visConns = connDefs.filter(c => c.week <= currentWeek);

  const isLinked = (id: string) => {
    if (!activeNode) return true;
    return connDefs.some(c => (c.from === activeNode && c.to === id) || (c.to === activeNode && c.from === id)) || id === activeNode;
  };

  const getCardStyle = (n: NodeDef) => {
    const showFixed = n.status === 'problem' && currentWeek >= 4;
    if (n.ring === 'ceo') return 'bg-gradient-to-br from-[#2a1f0a] to-[#1f1a0d] border-[#e09f18]/50 shadow-[0_0_20px_rgba(224,159,24,0.2)]';
    if (n.ring === 'brain') return 'bg-gradient-to-br from-emerald-700/25 to-cyan-700/15 border-emerald-400/40 shadow-[0_0_25px_rgba(0,255,136,0.2)]';
    if (showFixed) return 'bg-gradient-to-br from-emerald-900/25 to-emerald-800/15 border-emerald-400/40 shadow-[0_0_12px_rgba(0,255,136,0.15)]';
    if (n.status === 'problem') return 'bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-500/35 shadow-[0_0_12px_rgba(239,68,68,0.15)]';
    if (n.status === 'suggestion') return 'bg-gradient-to-br from-[#1a1f0a] to-[#14150a] border-[#e09f18]/30 shadow-[0_0_10px_rgba(224,159,24,0.1)]';
    if (n.status === 'fixed') return 'bg-gradient-to-br from-emerald-900/25 to-emerald-800/15 border-emerald-400/35 shadow-[0_0_12px_rgba(0,255,136,0.15)]';
    return 'bg-gradient-to-br from-[#0d1f18] to-[#0a150f] border-emerald-500/20 shadow-[0_0_8px_rgba(0,255,136,0.06)]';
  };

  const getTextColor = (n: NodeDef) => {
    const showFixed = n.status === 'problem' && currentWeek >= 4;
    if (n.ring === 'ceo') return 'text-[#e09f18]';
    if (n.ring === 'brain') return 'text-white';
    if (showFixed || n.status === 'fixed') return 'text-emerald-300';
    if (n.status === 'problem') return 'text-red-400';
    if (n.status === 'suggestion') return 'text-[#e09f18]';
    return 'text-emerald-400/80';
  };

  // Card size
  const cardW = cellW * 0.92;
  const cardH = cellH * 0.82;

  return (
    <div className="w-full max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-4">
      {/* ── Left Panel ── */}
      <div className="lg:w-[280px] flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
        {/* Week accordion */}
        <div className="space-y-2 mb-4">
          {weeks.map(wk => {
            const isExpanded = expandedWeeks.has(wk.id);
            const isCurrent = currentWeek === wk.id;
            const isPast = currentWeek > wk.id;
            return (
              <div key={wk.id} className={`rounded-xl border transition-all duration-500 ${
                isCurrent ? 'border-emerald-500/40 bg-emerald-500/5' :
                isPast ? 'border-white/10 bg-white/[0.02]' :
                'border-white/5 bg-transparent opacity-40'
              }`}>
                {/* Header — always visible, clickable */}
                <button
                  onClick={() => {
                    if (isPast || isCurrent) {
                      toggleWeek(wk.id);
                      if (!isCurrent) { setCurrentWeek(wk.id); setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-emerald-400' : isPast ? 'bg-emerald-600' : 'bg-white/20'}`} />
                    <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-300' : isPast ? 'text-white/60' : 'text-white/30'}`}>
                      {wk.title}: {wk.subtitle}
                    </span>
                  </div>
                  <span className={`text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isCurrent ? 'text-emerald-400' : 'text-white/30'}`}>▼</span>
                </button>

                {/* Content — collapsible */}
                <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-3 pb-3">
                    <ul className="space-y-1.5 mb-3">
                      {wk.bullets.map((b, i) => (
                        <li key={i} className={`flex items-start gap-2 transition-all duration-400 ${
                          isCurrent && i < visibleBullets ? 'opacity-100' : isCurrent ? 'opacity-0' : 'opacity-80'
                        }`}>
                          <span className="text-emerald-400 text-[10px] mt-0.5">→</span>
                          <span className="text-white/70 text-[11px] leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                    {/* Outcome */}
                    <div className={`rounded-lg px-2.5 py-2 text-[10px] ${
                      wk.id >= 3 ? 'bg-emerald-500/10 border border-emerald-400/20' :
                      wk.id === 2 ? 'bg-red-500/10 border border-red-400/20' :
                      'bg-white/5 border border-white/10'
                    }`}>
                      <div className={`font-bold ${wk.id >= 3 ? 'text-emerald-400' : wk.id === 2 ? 'text-red-400' : 'text-white/50'}`}>
                        {wk.outcomeStat}
                      </div>
                      <div className="text-white/50 mt-0.5">{wk.outcome}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Play button */}
        <button
          onClick={playStory}
          disabled={isPlaying}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
            isPlaying
              ? 'bg-emerald-500/10 text-emerald-300/40 cursor-not-allowed'
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
          }`}
        >
          {isPlaying ? '▶ Playing...' : '▶ Watch the 30-Day Journey'}
        </button>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 text-[9px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded border border-emerald-400/40 bg-emerald-900/25"></div>
            <span className="text-white/35">ACI System</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded border border-[#e09f18]/50 bg-[#2a1f0a]"></div>
            <span className="text-white/35">CEO Control</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded border border-red-500/35 bg-red-950/40"></div>
            <span className="text-white/35">Problem Found</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded border border-emerald-400/40 bg-emerald-900/25"></div>
            <span className="text-white/35">Solution Built</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-[#e09f18]">✋</span>
            <span className="text-white/35">Human Approval</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel (map) ── */}
      <div ref={mapRef} className="flex-1 relative" style={{ minHeight: h }}>
        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <filter id="gl">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {visConns.map((conn, i) => {
            const from = pos.get(conn.from);
            const to = pos.get(conn.to);
            if (!from || !to) return null;
            const isCEO = conn.from === 'ceo' || conn.to === 'ceo';
            const active = !activeNode || (isLinked(conn.from) && isLinked(conn.to));
            const color = isCEO || conn.checkpoint ? '#e09f18' : '#00ff88';
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;

            return (
              <g key={`${conn.from}-${conn.to}-${i}`} opacity={active ? 1 : 0.08} style={{ transition: 'opacity 0.5s' }}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={isCEO ? 2 : 1} opacity={0.3} />
                <circle r={isCEO ? 3 : 2} fill={color} opacity="0" filter="url(#gl)">
                  <animateMotion dur={`${3 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.35}s`} path={`M${from.x},${from.y} L${to.x},${to.y}`} />
                  <animate attributeName="opacity" values="0;0.7;0.7;0" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.35}s`} />
                </circle>
                {conn.checkpoint && (
                  <g>
                    <circle cx={mx} cy={my} r="10" fill="#0a1a12" stroke="#e09f18" strokeWidth="1.5" />
                    <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#e09f18">✋</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Node cards */}
        {visNodes.map(node => {
          const p = pos.get(node.id);
          if (!p) return null;
          const active = !activeNode || isLinked(node.id);
          const hovered = activeNode === node.id;
          const showFixed = node.status === 'problem' && currentWeek >= 4;

          return (
            <div
              key={node.id}
              className="absolute transition-all duration-600 ease-out cursor-pointer"
              style={{
                left: p.x - cardW / 2,
                top: p.y - cardH / 2,
                width: cardW,
                height: cardH,
                opacity: active ? 1 : 0.12,
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                zIndex: hovered ? 30 : 10,
                animation: node.week === currentWeek ? 'cardIn 0.6s ease-out' : undefined,
              }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className={`w-full h-full rounded-xl border ${getCardStyle(node)} flex flex-col justify-center px-3 py-2 transition-all duration-500 overflow-hidden`}>
                {/* Top row: icon + label */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`${node.ring === 'ceo' || node.ring === 'brain' ? 'text-xl' : 'text-base'} flex-shrink-0`}>
                    {showFixed ? '✅' : node.icon}
                  </span>
                  <div className="min-w-0">
                    <div className={`font-bold leading-tight truncate ${getTextColor(node)} ${
                      node.ring === 'ceo' || node.ring === 'brain' ? 'text-sm' : 'text-xs'
                    }`}>
                      {node.label}
                    </div>
                    <div className={`text-[9px] leading-tight truncate ${
                      node.ring === 'ceo' ? 'text-[#e09f18]/50' : 'text-white/30'
                    }`}>
                      {showFixed ? 'Resolved ✓' : node.subtitle}
                    </div>
                  </div>
                </div>

                {/* Detail */}
                <div className="text-[8px] leading-tight text-white/35 line-clamp-2 mb-1">
                  {node.detail}
                </div>

                {/* Stat badge */}
                {node.stat && (
                  <div className={`text-[8px] font-bold mt-auto ${
                    showFixed ? 'text-emerald-400' :
                    node.status === 'problem' ? 'text-red-400' :
                    node.status === 'fixed' ? 'text-emerald-400' :
                    node.status === 'suggestion' ? 'text-[#e09f18]' :
                    'text-emerald-500/50'
                  }`}>
                    {showFixed ? '✅ Fixed' : node.stat}
                  </div>
                )}
              </div>

              {/* Tooltip */}
              {hovered && (
                <div className="absolute left-1/2 -translate-x-1/2 z-40 bg-[#0a1a12] border border-emerald-500/30 rounded-lg px-3 py-2.5 text-[11px] text-emerald-100 w-[220px] text-center shadow-[0_0_20px_rgba(0,255,136,0.2)] pointer-events-none"
                  style={{ top: p.y < h * 0.3 ? '105%' : 'auto', bottom: p.y >= h * 0.3 ? '105%' : 'auto' }}>
                  <div className="font-bold text-white mb-1">{node.icon} {node.label}</div>
                  {node.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes cardIn {
          0% { opacity: 0; transform: scale(0.4) translateY(10px); }
          60% { transform: scale(1.05) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
