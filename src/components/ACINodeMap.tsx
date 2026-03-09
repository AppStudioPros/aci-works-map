'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Week Data ──────────────────────────────────────────
const weeks = [
  {
    id: 1, title: 'Week 1', subtitle: 'ACI Plugs In',
    bullets: [
      'Connects to your existing tools — zero disruption',
      'Maps your real org: who talks to who, how decisions flow',
      'CEO gets first report: "Here\'s what I see"',
    ],
    outcomeStat: 'Complete org mapping',
    outcome: 'Your org chart says one thing. Reality says another. Now you know both.',
  },
  {
    id: 2, title: 'Week 2', subtitle: 'ACI Learns',
    bullets: [
      'Identifies bottlenecks where work stalls',
      'Spots redundancy: duplicate tools & work',
      'Flags risk: knowledge trapped in key people',
    ],
    outcomeStat: '$4,200/mo waste found',
    outcome: '$4,200/mo in redundant tools. 23 hrs/week of duplicated work.',
  },
  {
    id: 3, title: 'Week 3', subtitle: 'ACI Suggests',
    bullets: [
      'CEO gets prioritized recommendations',
      'Nothing happens without your approval',
      'Quick wins first — biggest ROI',
    ],
    outcomeStat: '$8,400/mo savings approved',
    outcome: '3 quick wins approved by CEO. Estimated $8,400/mo + 34 hrs/week back.',
  },
  {
    id: 4, title: 'Week 4', subtitle: 'ACI Delivers',
    bullets: [
      'Custom automations deployed for YOUR company',
      'Team feels it: less friction, faster decisions',
      'Knowledge preserved — no single point of failure',
    ],
    outcomeStat: '$14,000 saved in 30 days',
    outcome: 'First month ROI: $14,000. Team velocity up 40%. Zero disruption.',
  },
];

// ── Node Data ──────────────────────────────────────────
interface NodeDef {
  id: string;
  label: string;
  subtitle: string;
  detail: string;
  stat?: string;
  lead?: string;
  icon: string;
  ring: 'ceo' | 'brain' | 'tool' | 'problem' | 'suggestion' | 'solution';
  week: number;
}

const nodeDefs: NodeDef[] = [
  // Anchors (always visible, consistent size)
  { id: 'ceo', label: 'CEO', subtitle: 'You', detail: 'Every action approved by you. Always in control.', icon: '👔', ring: 'ceo', week: 0 },
  { id: 'aci', label: 'ACI Brain', subtitle: 'Adaptive Compound Intelligence', detail: 'Learns, connects, and builds — gets smarter every day.', icon: '🧠', ring: 'brain', week: 0 },

  // Week 1: Tools
  { id: 'email', label: 'Email', subtitle: 'Communications', detail: 'Learns who talks to who, response times, decision chains across your org.', stat: '● Connected', lead: 'Auto-detected', icon: '📧', ring: 'tool', week: 1 },
  { id: 'slack', label: 'Messaging', subtitle: 'Slack / Teams', detail: 'Where real decisions happen. ACI captures context most tools miss.', stat: '● Connected', lead: 'Auto-detected', icon: '💬', ring: 'tool', week: 1 },
  { id: 'calendar', label: 'Calendar', subtitle: 'Scheduling & Meetings', detail: 'Meeting patterns, time allocation, who meets with who and why.', stat: '● Connected', lead: 'Auto-detected', icon: '📅', ring: 'tool', week: 1 },
  { id: 'docs', label: 'Documents', subtitle: 'Files & Reports', detail: 'Every doc, spreadsheet, wiki — who creates, who reads, what\'s stale.', stat: '● Connected', lead: 'Auto-detected', icon: '📄', ring: 'tool', week: 1 },
  { id: 'crm', label: 'CRM', subtitle: 'Sales & Pipeline', detail: 'Deal velocity, pipeline patterns, customer relationship health signals.', stat: '● Connected', lead: 'Auto-detected', icon: '🤝', ring: 'tool', week: 1 },
  { id: 'projects', label: 'Projects', subtitle: 'Task Management', detail: 'Task flow, blocked work, cross-team dependencies, sprint health.', stat: '● Connected', lead: 'Auto-detected', icon: '📋', ring: 'tool', week: 1 },
  { id: 'hr', label: 'HR Systems', subtitle: 'People & Culture', detail: 'Team structure, onboarding quality, flight risks, culture signals.', stat: '● Connected', lead: 'Auto-detected', icon: '👥', ring: 'tool', week: 1 },
  { id: 'analytics', label: 'Analytics', subtitle: 'Metrics & KPIs', detail: 'Business metrics connected to actual work patterns — not just dashboards.', stat: '● Connected', lead: 'Auto-detected', icon: '📊', ring: 'tool', week: 1 },
  { id: 'security', label: 'Security', subtitle: 'Compliance & Access', detail: 'Access patterns, anomaly detection, compliance tracking — preemptive.', stat: '● Connected', lead: 'Auto-detected', icon: '🔒', ring: 'tool', week: 1 },

  // Week 2: Problems
  { id: 'bottleneck', label: 'Bottlenecks Found', subtitle: '3 critical identified', detail: 'Approval chains causing avg 2-day delays. Marketing → Legal handoff broken.', stat: '⏱ 46 hrs/week lost', lead: 'Severity: High', icon: '🚧', ring: 'problem', week: 2 },
  { id: 'redundancy', label: 'Redundancy Found', subtitle: '4 tools overlap', detail: '3 teams building same weekly report. Salesforce + HubSpot doing same job.', stat: '💸 $4,200/mo wasted', lead: 'Severity: Medium', icon: '♻️', ring: 'problem', week: 2 },
  { id: 'risk', label: 'Knowledge Risk', subtitle: '2 critical people', detail: 'If Sarah (Eng) or Mike (Ops) leave, 40% of institutional knowledge gone.', stat: '⚠️ High flight risk', lead: 'Severity: Critical', icon: '⚠️', ring: 'problem', week: 2 },

  // Week 3: Suggestions
  { id: 'qw1', label: 'Quick Win #1', subtitle: 'Eliminate Status Meetings', detail: 'Replace 3 weekly status meetings with auto-generated async updates.', stat: '✋ CEO Approved', lead: 'Saves 12 hrs/week', icon: '💡', ring: 'suggestion', week: 3 },
  { id: 'qw2', label: 'Quick Win #2', subtitle: 'Consolidate Tools', detail: 'Replace Salesforce + HubSpot overlap with unified ACI dashboard.', stat: '✋ CEO Approved', lead: 'Saves $2,100/mo', icon: '💡', ring: 'suggestion', week: 3 },
  { id: 'qw3', label: 'Quick Win #3', subtitle: 'Knowledge Capture', detail: 'Auto-capture tribal knowledge from Sarah & Mike into searchable vault.', stat: '✋ CEO Approved', lead: 'Risk eliminated', icon: '💡', ring: 'suggestion', week: 3 },

  // Week 4: Solutions
  { id: 'sol1', label: 'Smart Workflow', subtitle: 'Custom Built for You', detail: 'Automated approval routing. 2-day delays → instant. Your rules, ACI executes.', stat: '✅ 46 hrs/week saved', lead: 'Live & running', icon: '⚙️', ring: 'solution', week: 4 },
  { id: 'sol2', label: 'Unified Dashboard', subtitle: 'Custom Built for You', detail: 'One view replaces 4 tools. Auto-generated reports. Always current.', stat: '✅ $4,200/mo saved', lead: 'Live & running', icon: '📈', ring: 'solution', week: 4 },
  { id: 'sol3', label: 'Knowledge Vault', subtitle: 'Custom Built for You', detail: 'All institutional knowledge indexed and searchable. Zero single points of failure.', stat: '✅ Risk eliminated', lead: 'Live & running', icon: '🏦', ring: 'solution', week: 4 },
];

// ── Connections ─────────────────────────────────────────
interface ConnDef { from: string; to: string; week: number; checkpoint?: boolean; }

const connDefs: ConnDef[] = [
  { from: 'ceo', to: 'aci', week: 0 },
  // Tools
  ...['email','slack','calendar','docs','crm','projects','hr','analytics','security'].map(id => ({ from: 'aci', to: id, week: 1 })),
  // Problems
  { from: 'aci', to: 'bottleneck', week: 2 }, { from: 'aci', to: 'redundancy', week: 2 }, { from: 'aci', to: 'risk', week: 2 },
  { from: 'email', to: 'bottleneck', week: 2 }, { from: 'projects', to: 'bottleneck', week: 2 },
  { from: 'analytics', to: 'redundancy', week: 2 }, { from: 'docs', to: 'redundancy', week: 2 },
  { from: 'hr', to: 'risk', week: 2 },
  // Suggestions
  { from: 'bottleneck', to: 'qw1', week: 3 }, { from: 'redundancy', to: 'qw2', week: 3 }, { from: 'risk', to: 'qw3', week: 3 },
  { from: 'aci', to: 'qw1', week: 3, checkpoint: true }, { from: 'aci', to: 'qw2', week: 3, checkpoint: true }, { from: 'aci', to: 'qw3', week: 3, checkpoint: true },
  // Solutions
  { from: 'qw1', to: 'sol1', week: 4 }, { from: 'qw2', to: 'sol2', week: 4 }, { from: 'qw3', to: 'sol3', week: 4 },
  { from: 'aci', to: 'sol1', week: 4 }, { from: 'aci', to: 'sol2', week: 4 }, { from: 'aci', to: 'sol3', week: 4 },
];

// ── Layout Engine ──────────────────────────────────────
function calcLayout(mapW: number, mapH: number, currentWeek: number) {
  const pos = new Map<string, { x: number; y: number; w: number; h: number }>();
  const padX = 30;
  const padY = 20;
  const usableW = mapW - padX * 2;
  const usableH = mapH - padY * 2;

  // Anchor sizes (consistent)
  const anchorW = 160;
  const anchorH = 70;

  // Big card (current week hero)
  const bigW = Math.min(usableW / 3.3, 220);
  const bigH = 120;

  // Small card (previous week, shrunk)
  const smW = Math.min(usableW / 5.5, 120);
  const smH = 44;

  // CEO: top center
  pos.set('ceo', { x: mapW / 2, y: padY + anchorH / 2, w: anchorW, h: anchorH });

  // ACI: below CEO
  pos.set('aci', { x: mapW / 2, y: padY + anchorH + 40 + anchorH / 2, w: anchorW, h: anchorH });

  const brainBottom = padY + anchorH + 40 + anchorH + 20;

  // Layout each week's nodes
  const weekGroups: { [key: number]: NodeDef[] } = {};
  nodeDefs.forEach(n => {
    if (n.week === 0) return; // anchors handled above
    if (!weekGroups[n.week]) weekGroups[n.week] = [];
    weekGroups[n.week].push(n);
  });

  // Calculate vertical zones for each week's row
  const visibleWeeks = Object.keys(weekGroups).map(Number).filter(wk => wk <= currentWeek).sort();
  const remainingH = usableH + padY * 2 - brainBottom - 20;

  let yOffset = brainBottom;

  visibleWeeks.forEach(wk => {
    const nodes = weekGroups[wk];
    if (!nodes) return;
    const isCurrent = wk === currentWeek;
    const cardW = isCurrent ? bigW : smW;
    const cardH = isCurrent ? bigH : smH;
    const gap = isCurrent ? 16 : 8;
    const rowH = cardH + (isCurrent ? 24 : 12);

    // Center the row
    const totalRowW = nodes.length * cardW + (nodes.length - 1) * gap;
    const startX = (mapW - totalRowW) / 2 + cardW / 2;

    nodes.forEach((n, i) => {
      pos.set(n.id, {
        x: startX + i * (cardW + gap),
        y: yOffset + cardH / 2,
        w: cardW,
        h: cardH,
      });
    });

    yOffset += rowH;
  });

  return pos;
}

// ── Component ──────────────────────────────────────────
export default function ACINodeMap() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [isPlaying, setIsPlaying] = useState(false);
  const [visBullets, setVisBullets] = useState(0);
  const [dims, setDims] = useState({ w: 900, h: 750 });
  const mapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bulletRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      if (mapRef.current) {
        const w = mapRef.current.offsetWidth;
        setDims({ w, h: Math.max(w * 0.75, 600) });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
      wk++;
      if (wk > 4) { if (timerRef.current) clearInterval(timerRef.current); setIsPlaying(false); return; }
      setCurrentWeek(wk);
    }, 7000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); if (bulletRef.current) clearInterval(bulletRef.current); }, []);

  const { w, h } = dims;
  const positions = calcLayout(w, h, currentWeek);

  const visNodes = nodeDefs.filter(n => n.week <= currentWeek || n.week === 0);
  const visConns = connDefs.filter(c => c.week <= currentWeek);

  const isLinked = (id: string) => {
    if (!activeNode) return true;
    return connDefs.some(c => (c.from === activeNode && c.to === id) || (c.to === activeNode && c.from === id)) || id === activeNode;
  };

  const weekData = weeks[currentWeek - 1];

  // Card styling
  const getStyle = (n: NodeDef) => {
    const isCurrent = n.week === currentWeek || n.week === 0;
    const showFixed = n.ring === 'problem' && currentWeek >= 4;
    if (n.ring === 'ceo') return 'bg-gradient-to-br from-[#2a1f0a] to-[#1f1a0d] border-[#e09f18]/50';
    if (n.ring === 'brain') return 'bg-gradient-to-br from-emerald-700/25 to-cyan-700/15 border-emerald-400/40';
    if (showFixed) return 'bg-gradient-to-br from-emerald-900/30 to-emerald-800/15 border-emerald-400/35';
    if (n.ring === 'problem') return 'bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-500/30';
    if (n.ring === 'suggestion') return 'bg-gradient-to-br from-[#1a1f0a] to-[#14150a] border-[#e09f18]/30';
    if (n.ring === 'solution') return 'bg-gradient-to-br from-emerald-900/30 to-emerald-800/15 border-emerald-400/35';
    return 'bg-gradient-to-br from-[#0d1f18] to-[#0a150f] border-emerald-500/20';
  };

  const getGlow = (n: NodeDef) => {
    if (n.ring === 'ceo') return 'shadow-[0_0_20px_rgba(224,159,24,0.15)]';
    if (n.ring === 'brain') return 'shadow-[0_0_25px_rgba(0,255,136,0.15)]';
    if (n.ring === 'problem') return 'shadow-[0_0_12px_rgba(239,68,68,0.12)]';
    if (n.ring === 'solution') return 'shadow-[0_0_12px_rgba(0,255,136,0.12)]';
    return 'shadow-[0_0_8px_rgba(0,255,136,0.05)]';
  };

  const getLabelColor = (n: NodeDef) => {
    const showFixed = n.ring === 'problem' && currentWeek >= 4;
    if (n.ring === 'ceo') return 'text-[#e09f18]';
    if (n.ring === 'brain') return 'text-white';
    if (showFixed || n.ring === 'solution') return 'text-emerald-300';
    if (n.ring === 'problem') return 'text-red-400';
    if (n.ring === 'suggestion') return 'text-[#e09f18]';
    return 'text-emerald-400';
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-3">
      {/* ── Left Panel (narrow) ── */}
      <div className="lg:w-[230px] flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
        {/* Week buttons */}
        <div className="flex lg:flex-col gap-1.5 mb-3">
          {weeks.map(wk => {
            const isCurrent = currentWeek === wk.id;
            const isPast = currentWeek > wk.id;
            const isExpanded = expandedWeeks.has(wk.id);
            return (
              <div key={wk.id} className={`rounded-xl border transition-all duration-500 ${
                isCurrent ? 'border-emerald-500/40 bg-emerald-500/5' :
                isPast ? 'border-white/10 bg-white/[0.02]' :
                'border-white/5 opacity-30'
              }`}>
                <button
                  onClick={() => {
                    if (isPast || isCurrent) { toggleWeek(wk.id); if (!isCurrent) { setCurrentWeek(wk.id); setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); } }
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-emerald-400 animate-pulse' : isPast ? 'bg-emerald-600' : 'bg-white/20'}`} />
                    <span className={`text-[10px] font-bold ${isCurrent ? 'text-emerald-300' : isPast ? 'text-white/50' : 'text-white/25'}`}>
                      {wk.title}: {wk.subtitle}
                    </span>
                  </div>
                  {(isPast || isCurrent) && (
                    <span className={`text-[8px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-white/30`}>▼</span>
                  )}
                </button>

                <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[300px]' : 'max-h-0'}`}>
                  <div className="px-2.5 pb-2.5">
                    <ul className="space-y-1 mb-2">
                      {wk.bullets.map((b, i) => (
                        <li key={i} className={`flex items-start gap-1.5 transition-all duration-400 ${
                          isCurrent && i < visBullets ? 'opacity-100' : isCurrent ? 'opacity-0' : 'opacity-70'
                        }`}>
                          <span className="text-emerald-400 text-[9px] mt-0.5">→</span>
                          <span className="text-white/60 text-[10px] leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`rounded-lg px-2 py-1.5 text-[9px] ${
                      wk.id >= 3 ? 'bg-emerald-500/10 border border-emerald-400/15' :
                      wk.id === 2 ? 'bg-red-500/10 border border-red-400/15' :
                      'bg-white/5 border border-white/8'
                    }`}>
                      <div className={`font-bold ${wk.id >= 3 ? 'text-emerald-400' : wk.id === 2 ? 'text-red-400' : 'text-white/50'}`}>
                        {wk.outcomeStat}
                      </div>
                      <div className="text-white/40 mt-0.5 leading-snug">{wk.outcome}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={playStory} disabled={isPlaying}
          className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all ${
            isPlaying ? 'bg-emerald-500/10 text-emerald-300/40 cursor-not-allowed'
            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
          }`}
        >
          {isPlaying ? '▶ Playing...' : '▶ Watch the 30-Day Journey'}
        </button>

        <div className="mt-3 space-y-1 text-[8px]">
          {[
            ['border-emerald-400/40 bg-emerald-900/25', 'ACI System'],
            ['border-[#e09f18]/50 bg-[#2a1f0a]', 'CEO / Approval'],
            ['border-red-500/30 bg-red-950/40', 'Problem Found'],
            ['border-emerald-400/35 bg-emerald-900/30', 'Solution Built'],
          ].map(([cls, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded border ${cls}`}></div>
              <span className="text-white/30">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-[#e09f18]">✋</span>
            <span className="text-white/30">Human-in-the-Loop</span>
          </div>
        </div>
      </div>

      {/* ── Map Panel ── */}
      <div ref={mapRef} className="flex-1 relative" style={{ minHeight: h }}>
        {/* SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <filter id="g5"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {visConns.map((conn, i) => {
            const fp = positions.get(conn.from);
            const tp = positions.get(conn.to);
            if (!fp || !tp) return null;
            const active = !activeNode || (isLinked(conn.from) && isLinked(conn.to));
            const isCEO = conn.from === 'ceo' || conn.to === 'ceo';
            const color = isCEO || conn.checkpoint ? '#e09f18' : '#00ff88';
            const mx = (fp.x + tp.x) / 2, my = (fp.y + tp.y) / 2;
            return (
              <g key={`${conn.from}-${conn.to}-${i}`} opacity={active ? 1 : 0.06} style={{ transition: 'opacity 0.5s' }}>
                <line x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} stroke={color} strokeWidth={isCEO ? 2 : 0.8} opacity={0.25} />
                <circle r={isCEO ? 3 : 1.5} fill={color} opacity="0" filter="url(#g5)">
                  <animateMotion dur={`${3 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} path={`M${fp.x},${fp.y} L${tp.x},${tp.y}`} />
                  <animate attributeName="opacity" values="0;0.6;0.6;0" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
                </circle>
                {conn.checkpoint && (
                  <g><circle cx={mx} cy={my} r="10" fill="#0a1a12" stroke="#e09f18" strokeWidth="1.5"/>
                  <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#e09f18">✋</text></g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Cards */}
        {visNodes.map(node => {
          const p = positions.get(node.id);
          if (!p) return null;
          const isCurrent = node.week === currentWeek || node.week === 0;
          const active = !activeNode || isLinked(node.id);
          const hovered = activeNode === node.id;

          return (
            <div
              key={node.id}
              className="absolute transition-all duration-700 ease-out cursor-pointer"
              style={{
                left: p.x - p.w / 2,
                top: p.y - p.h / 2,
                width: p.w,
                height: p.h,
                opacity: active ? 1 : 0.1,
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                zIndex: hovered ? 30 : isCurrent ? 20 : 5,
                animation: node.week === currentWeek ? 'cardIn5 0.6s ease-out' : undefined,
              }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className={`w-full h-full rounded-xl border ${getStyle(node)} ${getGlow(node)} flex flex-col justify-center overflow-hidden transition-all duration-500 ${
                isCurrent ? 'px-4 py-3' : 'px-2 py-1'
              }`}>
                {isCurrent ? (
                  /* ── BIG CARD (current week / anchors) ── */
                  <>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`${node.ring === 'ceo' || node.ring === 'brain' ? 'text-2xl' : 'text-xl'} flex-shrink-0`}>
                        {node.ring === 'problem' && currentWeek >= 4 ? '✅' : node.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`font-bold leading-tight ${getLabelColor(node)} text-sm`}>{node.label}</div>
                        <div className="text-white/30 text-[10px] leading-tight">{node.ring === 'problem' && currentWeek >= 4 ? 'Resolved ✓' : node.subtitle}</div>
                      </div>
                    </div>
                    {node.lead && (
                      <div className="text-[9px] text-white/25 mb-1">{node.lead}</div>
                    )}
                    <div className="text-[10px] leading-snug text-white/45 line-clamp-2 mb-1.5">{node.detail}</div>
                    {node.stat && (
                      <div className={`text-[10px] font-bold ${
                        node.ring === 'problem' && currentWeek >= 4 ? 'text-emerald-400' :
                        node.ring === 'problem' ? 'text-red-400' :
                        node.ring === 'solution' ? 'text-emerald-400' :
                        node.ring === 'suggestion' ? 'text-[#e09f18]' :
                        'text-emerald-500/50'
                      }`}>
                        {node.ring === 'problem' && currentWeek >= 4 ? '✅ Fixed' : node.stat}
                      </div>
                    )}
                  </>
                ) : (
                  /* ── SMALL CARD (previous week, shrunk) ── */
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm flex-shrink-0">
                      {node.ring === 'problem' && currentWeek >= 4 ? '✅' : node.icon}
                    </span>
                    <span className={`text-[9px] font-bold truncate ${getLabelColor(node)}`}>{node.label}</span>
                  </div>
                )}
              </div>

              {hovered && (
                <div className="absolute left-1/2 -translate-x-1/2 z-40 bg-[#0a1a12] border border-emerald-500/30 rounded-lg px-3 py-2 text-[11px] text-emerald-100 w-[220px] text-center shadow-[0_0_20px_rgba(0,255,136,0.2)] pointer-events-none"
                  style={{ top: p.y < h * 0.3 ? '108%' : 'auto', bottom: p.y >= h * 0.3 ? '108%' : 'auto' }}>
                  <div className="font-bold text-white mb-1">{node.icon} {node.label}</div>
                  {node.detail}
                  {node.stat && <div className="mt-1 font-bold text-emerald-400">{node.stat}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes cardIn5 {
          0% { opacity: 0; transform: scale(0.3) translateY(15px); }
          60% { transform: scale(1.05) translateY(-3px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
