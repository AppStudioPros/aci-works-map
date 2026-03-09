'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Week Data ──────────────────────────────────────────
const weeks = [
  {
    id: 1,
    title: 'Week 1',
    subtitle: 'ACI Plugs In',
    bullets: [
      'Connects to your existing tools — email, Slack, calendar, docs, HR, CRM',
      'Zero disruption. No migration. No training. No downtime.',
      'Maps your real org: who talks to who, how decisions actually flow',
      'CEO gets first report: "Here\'s what I see so far"',
    ],
    outcome: 'Your org chart says one thing. Reality says another. Now you know both.',
    outcomeStat: 'Org reality map delivered',
  },
  {
    id: 2,
    title: 'Week 2',
    subtitle: 'ACI Learns',
    bullets: [
      'Identifies bottlenecks — where work stalls, where approvals die',
      'Spots redundancy: 3 teams building the same report differently',
      'Flags risk: if Sarah leaves, 40% of institutional knowledge walks out',
      'Maps every tool your company pays for and how much actually gets used',
    ],
    outcome: '$4,200/mo in redundant tools identified. 23 hours/week of duplicated work found.',
    outcomeStat: '$4,200/mo waste found',
  },
  {
    id: 3,
    title: 'Week 3',
    subtitle: 'ACI Suggests',
    bullets: [
      'CEO gets prioritized recommendations — not surprises',
      'Every suggestion includes: what to fix, why, and projected impact',
      'Human-in-the-loop: nothing happens without your approval',
      'Quick wins first — biggest ROI, lowest disruption',
    ],
    outcome: '3 quick wins approved. Estimated savings: $8,400/mo and 34 hours/week back to revenue work.',
    outcomeStat: '$8,400/mo savings approved',
  },
  {
    id: 4,
    title: 'Week 4',
    subtitle: 'ACI Builds & Delivers',
    bullets: [
      'Custom automations deployed — built for YOUR company, not templates',
      'Team feels it immediately: less friction, fewer meetings, faster decisions',
      'Knowledge preserved — nothing trapped in one person\'s head anymore',
      'ACI keeps learning. Month 2 is even better than month 1.',
    ],
    outcome: 'First month ROI: $14,000 saved. Team velocity up 40%. Zero disruption.',
    outcomeStat: '$14,000 saved in 30 days',
  },
];

// ── Node Data ──────────────────────────────────────────
interface NodeDef {
  id: string;
  label: string;
  detail: string;
  icon: string;
  ring: 'ceo' | 'brain' | 'inner' | 'outer';
  week: number;
  angle?: number;
  status?: 'neutral' | 'problem' | 'fixed';
}

const nodeDefs: NodeDef[] = [
  // CEO
  { id: 'ceo', label: 'CEO', detail: 'You stay in control. Every action approved by you.', icon: '👔', ring: 'ceo', week: 1 },
  // Brain
  { id: 'aci', label: 'ACI Brain', detail: 'Learns, connects, and builds — gets smarter every day.', icon: '🧠', ring: 'brain', week: 1 },

  // Outer ring — tools (Week 1: they connect)
  { id: 'email', label: 'Email', detail: 'Learns communication patterns, decision chains, response times.', icon: '📧', ring: 'outer', week: 1, angle: 0 },
  { id: 'slack', label: 'Messaging', detail: 'Slack, Teams — where real decisions happen (not in meetings).', icon: '💬', ring: 'outer', week: 1, angle: 45 },
  { id: 'calendar', label: 'Calendar', detail: 'Meeting patterns, time allocation, scheduling bottlenecks.', icon: '📅', ring: 'outer', week: 1, angle: 90 },
  { id: 'docs', label: 'Documents', detail: 'Every doc, spreadsheet, report — who creates, who reads, what\'s stale.', icon: '📄', ring: 'outer', week: 1, angle: 135 },
  { id: 'hr', label: 'HR Systems', detail: 'Team structure, onboarding gaps, flight risks, culture signals.', icon: '👥', ring: 'outer', week: 1, angle: 180 },
  { id: 'crm', label: 'CRM', detail: 'Pipeline patterns, deal velocity, customer relationship health.', icon: '🤝', ring: 'outer', week: 1, angle: 225 },
  { id: 'projects', label: 'Project Tools', detail: 'Task flow, blocked work, cross-team dependencies.', icon: '📋', ring: 'outer', week: 1, angle: 270 },
  { id: 'analytics', label: 'Analytics', detail: 'KPIs, trends, metrics — connected to actual work patterns.', icon: '📊', ring: 'outer', week: 1, angle: 315 },

  // Inner ring — Week 2: problems found
  { id: 'bottleneck', label: 'Bottlenecks Found', detail: 'Where work stalls: approval chains, single points of failure, slow handoffs.', icon: '🚧', ring: 'inner', week: 2, angle: 0, status: 'problem' },
  { id: 'redundancy', label: 'Redundancy Found', detail: '3 teams doing the same report. 4 tools doing the same job. $4,200/mo wasted.', icon: '♻️', ring: 'inner', week: 2, angle: 120, status: 'problem' },
  { id: 'risk', label: 'Risks Flagged', detail: 'If key people leave, critical knowledge walks out. ACI preserves it.', icon: '⚠️', ring: 'inner', week: 2, angle: 240, status: 'problem' },

  // Inner ring — Week 3: suggestions (checkpoint icons)
  { id: 'quickwin1', label: 'Quick Win #1', detail: 'Eliminate redundant weekly status meeting → saves 12 hrs/week across team.', icon: '✅', ring: 'inner', week: 3, angle: 60 },
  { id: 'quickwin2', label: 'Quick Win #2', detail: 'Consolidate 3 reporting tools into 1 automated dashboard → saves $2,100/mo.', icon: '✅', ring: 'inner', week: 3, angle: 180 },
  { id: 'quickwin3', label: 'Quick Win #3', detail: 'Auto-capture tribal knowledge from top performers → risk eliminated.', icon: '✅', ring: 'inner', week: 3, angle: 300 },

  // Inner ring — Week 4: built solutions
  { id: 'custom1', label: 'Custom Automation', detail: 'Built for YOUR workflow — not a template. Handles the busywork so your team focuses on revenue.', icon: '⚙️', ring: 'inner', week: 4, angle: 30, status: 'fixed' },
  { id: 'custom2', label: 'Smart Reports', detail: 'Reports that match how YOUR team makes decisions. Auto-generated, always current.', icon: '📈', ring: 'inner', week: 4, angle: 150, status: 'fixed' },
  { id: 'custom3', label: 'Knowledge Vault', detail: 'Institutional knowledge preserved forever. No single point of failure. Ever.', icon: '🏦', ring: 'inner', week: 4, angle: 270, status: 'fixed' },
];

interface ConnDef {
  from: string;
  to: string;
  week: number;
  checkpoint?: boolean;
}

const connDefs: ConnDef[] = [
  // CEO ↔ ACI (always)
  { from: 'ceo', to: 'aci', week: 1 },

  // Week 1: tools connect to ACI
  { from: 'aci', to: 'email', week: 1 },
  { from: 'aci', to: 'slack', week: 1 },
  { from: 'aci', to: 'calendar', week: 1 },
  { from: 'aci', to: 'docs', week: 1 },
  { from: 'aci', to: 'hr', week: 1 },
  { from: 'aci', to: 'crm', week: 1 },
  { from: 'aci', to: 'projects', week: 1 },
  { from: 'aci', to: 'analytics', week: 1 },

  // Week 2: problems found
  { from: 'aci', to: 'bottleneck', week: 2 },
  { from: 'aci', to: 'redundancy', week: 2 },
  { from: 'aci', to: 'risk', week: 2 },
  { from: 'email', to: 'bottleneck', week: 2 },
  { from: 'projects', to: 'bottleneck', week: 2 },
  { from: 'analytics', to: 'redundancy', week: 2 },
  { from: 'docs', to: 'redundancy', week: 2 },
  { from: 'hr', to: 'risk', week: 2 },

  // Week 3: suggestions → CEO approves
  { from: 'aci', to: 'quickwin1', week: 3, checkpoint: true },
  { from: 'aci', to: 'quickwin2', week: 3, checkpoint: true },
  { from: 'aci', to: 'quickwin3', week: 3, checkpoint: true },
  { from: 'ceo', to: 'quickwin1', week: 3, checkpoint: true },
  { from: 'ceo', to: 'quickwin2', week: 3, checkpoint: true },
  { from: 'ceo', to: 'quickwin3', week: 3, checkpoint: true },

  // Week 4: solutions deployed
  { from: 'aci', to: 'custom1', week: 4 },
  { from: 'aci', to: 'custom2', week: 4 },
  { from: 'aci', to: 'custom3', week: 4 },
  { from: 'bottleneck', to: 'custom1', week: 4 },
  { from: 'redundancy', to: 'custom2', week: 4 },
  { from: 'risk', to: 'custom3', week: 4 },
];

// ── Layout Calculator ──────────────────────────────────
function calcPositions(w: number, h: number) {
  const cx = w / 2;
  const cy = h * 0.52;
  const innerR = Math.min(w, h) * 0.19;
  const outerR = Math.min(w, h) * 0.38;
  const pos = new Map<string, { x: number; y: number }>();

  pos.set('ceo', { x: cx, y: h * 0.08 });
  pos.set('aci', { x: cx, y: cy });

  nodeDefs.forEach(n => {
    if (n.ring === 'ceo' || n.ring === 'brain') return;
    const r = n.ring === 'inner' ? innerR : outerR;
    const a = ((n.angle ?? 0) - 90) * Math.PI / 180;
    pos.set(n.id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  });

  return pos;
}

// ── Main Component ─────────────────────────────────────
export default function ACINodeMap() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleBullets, setVisibleBullets] = useState(0);
  const [dims, setDims] = useState({ w: 600, h: 600 });
  const mapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bulletTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive
  useEffect(() => {
    const update = () => {
      if (mapRef.current) {
        const w = Math.min(mapRef.current.offsetWidth, 650);
        setDims({ w, h: w });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Animate bullets when week changes
  useEffect(() => {
    setVisibleBullets(0);
    if (bulletTimerRef.current) clearInterval(bulletTimerRef.current);
    let count = 0;
    const maxBullets = weeks[currentWeek - 1].bullets.length;
    bulletTimerRef.current = setInterval(() => {
      count++;
      setVisibleBullets(count);
      if (count >= maxBullets) {
        if (bulletTimerRef.current) clearInterval(bulletTimerRef.current);
      }
    }, 800);
    return () => { if (bulletTimerRef.current) clearInterval(bulletTimerRef.current); };
  }, [currentWeek]);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bulletTimerRef.current) clearInterval(bulletTimerRef.current);
    };
  }, []);

  const { w, h } = dims;
  const positions = calcPositions(w, h);

  const visNodes = nodeDefs.filter(n => n.week <= currentWeek);
  const visConns = connDefs.filter(c => c.week <= currentWeek);
  const weekData = weeks[currentWeek - 1];

  const isLinkedToActive = (id: string) => {
    if (!activeNode) return true;
    return connDefs.some(c => (c.from === activeNode && c.to === id) || (c.to === activeNode && c.from === id)) || id === activeNode;
  };

  const getNodeColor = (n: NodeDef) => {
    if (n.ring === 'ceo') return 'from-[#2a1f0a] to-[#1a1508] border-[#e09f18]/60 shadow-[0_0_20px_rgba(224,159,24,0.25)]';
    if (n.ring === 'brain') return 'from-emerald-600/30 to-cyan-600/20 border-emerald-400/50 shadow-[0_0_25px_rgba(0,255,136,0.25)]';
    if (n.status === 'problem') return 'from-red-900/30 to-red-800/20 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    if (n.status === 'fixed') return 'from-emerald-900/30 to-emerald-800/20 border-emerald-400/40 shadow-[0_0_15px_rgba(0,255,136,0.2)]';
    if (n.id.startsWith('quickwin')) return 'from-[#1a1f0a] to-[#141508] border-[#e09f18]/35 shadow-[0_0_12px_rgba(224,159,24,0.15)]';
    if (n.ring === 'inner') return 'from-[#0d2118] to-[#0a1a12] border-emerald-500/25 shadow-[0_0_10px_rgba(0,255,136,0.1)]';
    return 'from-[#0a1510] to-[#080f0b] border-emerald-500/15 shadow-[0_0_8px_rgba(0,255,136,0.06)]';
  };

  // Box sizes based on ring
  const getSize = (ring: string) => {
    const base = Math.min(w, h);
    if (ring === 'ceo') return { bw: base * 0.18, bh: base * 0.08 };
    if (ring === 'brain') return { bw: base * 0.17, bh: base * 0.08 };
    if (ring === 'inner') return { bw: base * 0.16, bh: base * 0.1 };
    return { bw: base * 0.14, bh: base * 0.09 };
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6">
      {/* ── Left Panel (sticky story) ── */}
      <div className="lg:w-[380px] flex-shrink-0 lg:sticky lg:top-8 lg:self-start">
        {/* Week selector */}
        <div className="flex gap-2 mb-6">
          {weeks.map(wk => (
            <button
              key={wk.id}
              onClick={() => { setCurrentWeek(wk.id); setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ${
                currentWeek === wk.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50 scale-105'
                  : currentWeek > wk.id
                    ? 'bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/20'
                    : 'bg-white/5 text-white/25 border border-white/10'
              }`}
            >
              Wk {wk.id}
            </button>
          ))}
        </div>

        {/* Week info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">{weekData.title}: <span className="text-emerald-400">{weekData.subtitle}</span></h2>
        </div>

        {/* Bullet points (animate in) */}
        <ul className="space-y-3 mb-6 min-h-[160px]">
          {weekData.bullets.map((bullet, i) => (
            <li
              key={`${currentWeek}-${i}`}
              className={`flex items-start gap-3 transition-all duration-500 ${
                i < visibleBullets ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              <span className="text-emerald-400 mt-0.5 text-lg leading-none">→</span>
              <span className="text-white/80 text-sm leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Outcome card */}
        <div className={`rounded-xl border p-4 transition-all duration-700 ${
          visibleBullets >= weekData.bullets.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${
          currentWeek >= 3
            ? 'bg-emerald-500/10 border-emerald-400/30'
            : currentWeek === 2
              ? 'bg-red-500/10 border-red-400/30'
              : 'bg-white/5 border-white/10'
        }`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${
            currentWeek >= 3 ? 'text-emerald-400' : currentWeek === 2 ? 'text-red-400' : 'text-white/50'
          }`}>
            {currentWeek === 2 ? '⚠️ Found' : currentWeek >= 3 ? '💰 Outcome' : '📊 Result'}
          </div>
          <div className="text-white font-semibold text-base mb-1">{weekData.outcomeStat}</div>
          <div className="text-white/60 text-sm">{weekData.outcome}</div>
        </div>

        {/* Play button */}
        <button
          onClick={playStory}
          disabled={isPlaying}
          className={`mt-6 w-full py-3 rounded-xl text-sm font-bold transition-all ${
            isPlaying
              ? 'bg-emerald-500/10 text-emerald-300/40 cursor-not-allowed'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 hover:scale-[1.02]'
          }`}
        >
          {isPlaying ? '▶ Playing Story...' : '▶ Watch the 30-Day Journey'}
        </button>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-600/30 to-cyan-600/20 border border-emerald-400/50"></div>
            <span className="text-white/40">ACI System</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-[#2a1f0a] to-[#1a1508] border border-[#e09f18]/60"></div>
            <span className="text-white/40">CEO / Human Approval</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/40"></div>
            <span className="text-white/40">Problem Found</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 border border-emerald-400/40"></div>
            <span className="text-white/40">Solution Deployed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#e09f18]">✋</span>
            <span className="text-white/40">Human-in-the-Loop</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel (node map) ── */}
      <div ref={mapRef} className="flex-1 relative" style={{ minHeight: h }}>
        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <filter id="glow3">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ring guides */}
          <circle cx={w/2} cy={h*0.52} r={Math.min(w,h)*0.19} fill="none" stroke="#1a3a2a" strokeWidth="1" opacity="0.15" strokeDasharray="6 4" />
          <circle cx={w/2} cy={h*0.52} r={Math.min(w,h)*0.38} fill="none" stroke="#1a3a2a" strokeWidth="1" opacity="0.1" strokeDasharray="6 4" />

          {visConns.map((conn, i) => {
            const from = positions.get(conn.from);
            const to = positions.get(conn.to);
            if (!from || !to) return null;
            const isCEO = conn.from === 'ceo' || conn.to === 'ceo';
            const isActive = !activeNode || (isLinkedToActive(conn.from) && isLinkedToActive(conn.to));
            const color = isCEO || conn.checkpoint ? '#e09f18' : '#00ff88';
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;

            return (
              <g key={`${conn.from}-${conn.to}-${conn.week}`} opacity={isActive ? 1 : 0.1} style={{ transition: 'opacity 0.6s' }}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={color} strokeWidth={isCEO ? 2 : 1} opacity={0.35} />
                <circle r={isCEO ? 3.5 : 2} fill={color} opacity="0" filter="url(#glow3)">
                  <animateMotion dur={`${2.5 + (i % 4)}s`} repeatCount="indefinite" begin={`${i * 0.3}s`}
                    path={`M${from.x},${from.y} L${to.x},${to.y}`} />
                  <animate attributeName="opacity" values="0;0.7;0.7;0" dur={`${2.5 + (i % 4)}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
                </circle>
                {conn.checkpoint && (
                  <g>
                    <circle cx={mx} cy={my} r="9" fill="#0a1a12" stroke="#e09f18" strokeWidth="1.5" />
                    <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#e09f18">✋</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {visNodes.map(node => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const { bw, bh } = getSize(node.ring);
          const isActive = !activeNode || isLinkedToActive(node.id);
          const isHovered = activeNode === node.id;
          const colorClass = getNodeColor(node);

          // Problems turn green in week 4
          const showFixed = node.status === 'problem' && currentWeek >= 4;

          return (
            <div
              key={node.id}
              className="absolute transition-all duration-700 ease-out cursor-pointer"
              style={{
                left: pos.x - bw / 2,
                top: pos.y - bh / 2,
                width: bw,
                height: bh,
                opacity: isActive ? 1 : 0.15,
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                zIndex: isHovered ? 30 : node.ring === 'ceo' ? 25 : node.ring === 'brain' ? 20 : 10,
                animation: node.week === currentWeek ? 'nodeIn 0.7s ease-out' : undefined,
              }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className={`w-full h-full rounded-xl border bg-gradient-to-br ${showFixed ? 'from-emerald-900/30 to-emerald-800/20 border-emerald-400/40 shadow-[0_0_15px_rgba(0,255,136,0.2)]' : colorClass} flex flex-col items-center justify-center px-2 py-1.5 transition-all duration-500`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`${node.ring === 'ceo' || node.ring === 'brain' ? 'text-lg' : 'text-sm'}`}>
                    {showFixed ? '✅' : node.icon}
                  </span>
                  <span className={`font-bold leading-tight ${
                    node.ring === 'ceo' ? 'text-[#e09f18] text-xs' :
                    node.ring === 'brain' ? 'text-white text-xs' :
                    node.status === 'problem' && !showFixed ? 'text-red-400 text-[10px]' :
                    node.status === 'fixed' || showFixed ? 'text-emerald-300 text-[10px]' :
                    node.id.startsWith('quickwin') ? 'text-[#e09f18] text-[10px]' :
                    node.ring === 'inner' ? 'text-emerald-300 text-[10px]' :
                    'text-emerald-400/70 text-[10px]'
                  }`}>
                    {node.label}
                  </span>
                </div>
                <span className={`text-[8px] leading-tight text-center line-clamp-2 ${
                  node.ring === 'ceo' ? 'text-[#e09f18]/60' : 'text-white/40'
                }`}>
                  {node.detail}
                </span>
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 z-40 bg-[#0a1a12] border border-emerald-500/30 rounded-lg px-4 py-3 text-xs text-emerald-100 w-[240px] text-center shadow-[0_0_20px_rgba(0,255,136,0.2)] pointer-events-none"
                  style={{ top: pos.y < h * 0.35 ? '108%' : 'auto', bottom: pos.y >= h * 0.35 ? '108%' : 'auto' }}>
                  <div className="font-bold text-white mb-1">{node.icon} {node.label}</div>
                  {node.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes nodeIn {
          0% { opacity: 0; transform: scale(0.3); }
          60% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
