'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Weeks ──────────────────────────────────────────────
const weeks = [
  { id: 1, title: 'Week 1', subtitle: 'ACI Plugs In',
    bullets: ['Connects to your existing tools — zero disruption', 'Maps your real org: who talks to who', 'CEO gets first report: "Here\'s what I see"'],
    outcomeStat: 'Org reality map', outcome: 'Your org chart says one thing. Reality says another. Now you know both.' },
  { id: 2, title: 'Week 2', subtitle: 'ACI Learns',
    bullets: ['Identifies bottlenecks where work stalls', 'Spots tool & work redundancy', 'Flags knowledge risk in key people'],
    outcomeStat: '$4,200/mo waste found', outcome: '23 hrs/week of duplicated work. 46 hrs/week lost to bottlenecks.' },
  { id: 3, title: 'Week 3', subtitle: 'ACI Suggests',
    bullets: ['CEO gets prioritized recommendations', 'Nothing happens without your approval', 'Quick wins first — biggest ROI'],
    outcomeStat: '$8,400/mo approved', outcome: '3 quick wins approved. 34 hrs/week returned to revenue work.' },
  { id: 4, title: 'Week 4', subtitle: 'ACI Delivers',
    bullets: ['Custom automations deployed', 'Less friction, faster decisions', 'Knowledge preserved forever'],
    outcomeStat: '$14,000 saved', outcome: 'Team velocity up 40%. Zero disruption. ACI keeps compounding.' },
];

// ── Nodes ──────────────────────────────────────────────
interface NodeDef {
  id: string; label: string; subtitle: string; detail: string;
  stat?: string; color: string; icon: string; week: number;
  group: 'anchor' | 'tool' | 'problem' | 'suggestion' | 'solution';
}

const COLORS = {
  gold: '#e09f18', green: '#10b981', red: '#ef4444', cyan: '#06b6d4', purple: '#a855f7',
  emerald: '#34d399', blue: '#3b82f6', orange: '#f97316', pink: '#ec4899', teal: '#14b8a6',
};

const nodeDefs: NodeDef[] = [
  { id: 'ceo', label: 'CEO', subtitle: 'You — always in control', detail: 'Every action confirmed with you first.', color: COLORS.gold, icon: '👔', week: 0, group: 'anchor' },
  { id: 'aci', label: 'ACI Brain', subtitle: 'Adaptive Compound Intelligence', detail: 'Learns, connects, builds — smarter every day.', color: COLORS.emerald, icon: '🧠', week: 0, group: 'anchor' },

  { id: 'email', label: 'Email', subtitle: 'Communications', detail: 'Who talks to who, decision chains, response patterns.', stat: '● Connected', color: COLORS.green, icon: '📧', week: 1, group: 'tool' },
  { id: 'slack', label: 'Messaging', subtitle: 'Slack / Teams', detail: 'Where real decisions happen — context captured.', stat: '● Connected', color: COLORS.cyan, icon: '💬', week: 1, group: 'tool' },
  { id: 'calendar', label: 'Calendar', subtitle: 'Scheduling', detail: 'Meeting patterns, time allocation, who meets who.', stat: '● Connected', color: COLORS.blue, icon: '📅', week: 1, group: 'tool' },
  { id: 'docs', label: 'Documents', subtitle: 'Files & Reports', detail: 'Who creates, who reads, what\'s stale or critical.', stat: '● Connected', color: COLORS.purple, icon: '📄', week: 1, group: 'tool' },
  { id: 'crm', label: 'CRM', subtitle: 'Sales & Pipeline', detail: 'Deal patterns, pipeline health, relationship signals.', stat: '● Connected', color: COLORS.orange, icon: '🤝', week: 1, group: 'tool' },
  { id: 'projects', label: 'Projects', subtitle: 'Task Management', detail: 'Task flow, blocked work, cross-team dependencies.', stat: '● Connected', color: COLORS.teal, icon: '📋', week: 1, group: 'tool' },
  { id: 'hr', label: 'HR Systems', subtitle: 'People & Culture', detail: 'Team structure, flight risks, culture signals.', stat: '● Connected', color: COLORS.pink, icon: '👥', week: 1, group: 'tool' },
  { id: 'analytics', label: 'Analytics', subtitle: 'Metrics & KPIs', detail: 'Trends connected to actual work patterns.', stat: '● Connected', color: COLORS.blue, icon: '📊', week: 1, group: 'tool' },
  { id: 'security', label: 'Security', subtitle: 'Compliance', detail: 'Access anomalies, compliance tracking.', stat: '● Connected', color: COLORS.red, icon: '🔒', week: 1, group: 'tool' },

  { id: 'bottleneck', label: 'Bottlenecks', subtitle: '3 critical found', detail: 'Approval chains causing 2-day avg delays.', stat: '⏱ 46 hrs/week lost', color: COLORS.red, icon: '🚧', week: 2, group: 'problem' },
  { id: 'redundancy', label: 'Redundancy', subtitle: '4 tools overlap', detail: '3 teams building same report differently.', stat: '💸 $4,200/mo wasted', color: COLORS.red, icon: '♻️', week: 2, group: 'problem' },
  { id: 'risk', label: 'Knowledge Risk', subtitle: '2 key people', detail: '40% institutional knowledge at risk of walking out.', stat: '⚠️ Critical', color: COLORS.red, icon: '⚠️', week: 2, group: 'problem' },

  { id: 'qw1', label: 'Quick Win #1', subtitle: 'Cut Status Meetings', detail: 'Replace 3 weekly meetings with async updates.', stat: '✋ CEO Approved · 12 hrs/wk', color: COLORS.gold, icon: '💡', week: 3, group: 'suggestion' },
  { id: 'qw2', label: 'Quick Win #2', subtitle: 'Consolidate Tools', detail: 'Unified dashboard replaces overlapping tools.', stat: '✋ CEO Approved · $2,100/mo', color: COLORS.gold, icon: '💡', week: 3, group: 'suggestion' },
  { id: 'qw3', label: 'Quick Win #3', subtitle: 'Knowledge Capture', detail: 'Auto-capture tribal knowledge into vault.', stat: '✋ CEO Approved · Risk gone', color: COLORS.gold, icon: '💡', week: 3, group: 'suggestion' },

  { id: 'sol1', label: 'Smart Workflow', subtitle: 'Custom Built', detail: 'Automated routing. 2-day delays → instant.', stat: '✅ 46 hrs/week saved', color: COLORS.emerald, icon: '⚙️', week: 4, group: 'solution' },
  { id: 'sol2', label: 'Unified Dashboard', subtitle: 'Custom Built', detail: 'One view replaces 4 tools. Always current.', stat: '✅ $4,200/mo saved', color: COLORS.emerald, icon: '📈', week: 4, group: 'solution' },
  { id: 'sol3', label: 'Knowledge Vault', subtitle: 'Custom Built', detail: 'All knowledge indexed. Zero single points of failure.', stat: '✅ Risk eliminated', color: COLORS.emerald, icon: '🏦', week: 4, group: 'solution' },
];

// ── NodeCard Component (AcuSightPro style) ─────────────
function NodeCard({ node, isBig, isActive, isHovered, onHover, onLeave, showFixed }: {
  node: NodeDef; isBig: boolean; isActive: boolean; isHovered: boolean;
  onHover: () => void; onLeave: () => void; showFixed?: boolean;
}) {
  const borderColor = showFixed ? COLORS.emerald : node.color;

  if (!isBig) {
    // ── COMPACT pill ──
    return (
      <div
        onMouseEnter={onHover} onMouseLeave={onLeave}
        className="rounded-lg border bg-[#0a0a0f]/90 backdrop-blur-sm flex items-center gap-2 px-3 py-2 cursor-pointer transition-all duration-300 hover:scale-[1.03]"
        style={{ borderColor: `${borderColor}25`, opacity: isActive ? 1 : 0.15 }}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: borderColor }} />
        <span className="text-[11px] font-medium text-white/70 truncate">{showFixed ? '✅' : node.icon} {node.label}</span>
      </div>
    );
  }

  // ── BIG detailed card (AcuSightPro style) ──
  return (
    <div
      onMouseEnter={onHover} onMouseLeave={onLeave}
      className={`rounded-xl border overflow-hidden bg-[#0a0a0f]/90 backdrop-blur-sm cursor-pointer transition-all duration-500 ${
        isHovered ? 'scale-[1.03] z-20' : ''
      }`}
      style={{
        borderColor: `${borderColor}30`,
        opacity: isActive ? 1 : 0.15,
        boxShadow: `0 0 ${isHovered ? 20 : 10}px ${borderColor}15`,
      }}
    >
      {/* Header bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${borderColor}15, transparent)` }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: borderColor }} />
          <span className="text-[13px] font-semibold text-white">{showFixed ? '✅ ' : ''}{node.label}</span>
        </div>
        <span className="text-lg">{showFixed ? '✅' : node.icon}</span>
      </div>

      {/* Subtitle */}
      <div className="px-3.5 py-1.5 border-t" style={{ borderColor: `${borderColor}12` }}>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">
          {showFixed ? 'Resolved' : node.group === 'tool' ? 'Integration' : node.group === 'problem' ? 'Issue Found' : node.group === 'suggestion' ? 'Recommendation' : 'Deployed'}
        </div>
        <div className="text-[12px] text-white/60 font-medium">{showFixed ? 'Problem resolved ✓' : node.subtitle}</div>
      </div>

      {/* Detail */}
      <div className="px-3.5 py-1.5 border-t" style={{ borderColor: `${borderColor}08` }}>
        <div className="text-[10px] text-white/40 leading-relaxed">{node.detail}</div>
      </div>

      {/* Stat footer */}
      {node.stat && (
        <div className="px-3.5 py-2 border-t flex items-center justify-between" style={{ borderColor: `${borderColor}10` }}>
          <span className="text-[10px] font-bold" style={{ color: showFixed ? COLORS.emerald : borderColor }}>
            {showFixed ? '✅ Fixed' : node.stat}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
export default function ACINodeMap() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeNode, setActiveNode] = useState<string | null>(null);
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

  const isLinked = (id: string) => {
    if (!activeNode) return true;
    // Simple: same week or anchor
    const n = nodeDefs.find(nd => nd.id === id);
    const a = nodeDefs.find(nd => nd.id === activeNode);
    if (!n || !a) return true;
    return n.week === a.week || n.group === 'anchor' || a.group === 'anchor' || id === activeNode;
  };

  // Group nodes by week
  const anchors = nodeDefs.filter(n => n.group === 'anchor');
  const weekNodes: { [key: number]: NodeDef[] } = {};
  nodeDefs.filter(n => n.week > 0).forEach(n => {
    if (!weekNodes[n.week]) weekNodes[n.week] = [];
    weekNodes[n.week].push(n);
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4">
      {/* ── Left Panel (200px, flush left) ── */}
      <div className="lg:w-[200px] flex-shrink-0">
        <div className="lg:sticky lg:top-4 space-y-1.5">
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

          <button onClick={playStory} disabled={isPlaying}
            className={`w-full py-1.5 rounded-lg text-[9px] font-bold mt-2 transition-all ${
              isPlaying ? 'bg-emerald-500/10 text-emerald-300/30 cursor-not-allowed'
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}>
            {isPlaying ? '▶ Playing...' : '▶ Watch 30-Day Journey'}
          </button>

          <div className="mt-2 space-y-0.5 text-[7px]">
            {[['#10b981', 'System'], ['#e09f18', 'CEO / Approval'], ['#ef4444', 'Problem'], ['#34d399', 'Solution'], ['#e09f18', '✋ Human-in-Loop']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: c }}></div>
                <span className="text-white/25">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map Panel (CSS Grid layout) ── */}
      <div className="flex-1 space-y-4">
        {/* Anchors: CEO → ACI */}
        <div className="flex justify-center gap-4">
          {anchors.map(n => (
            <div key={n.id} className="w-[200px]">
              <NodeCard node={n} isBig={true} isActive={isLinked(n.id)} isHovered={activeNode === n.id}
                onHover={() => setActiveNode(n.id)} onLeave={() => setActiveNode(null)} />
            </div>
          ))}
        </div>

        {/* Each visible week */}
        {[1, 2, 3, 4].filter(wk => wk <= currentWeek).map(wk => {
          const nodes = weekNodes[wk] || [];
          const isCurrent = wk === currentWeek;
          const weekInfo = weeks[wk - 1];

          return (
            <div key={wk}>
              {/* Week label */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-px flex-1 ${isCurrent ? 'bg-emerald-500/20' : 'bg-white/5'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-emerald-400' : 'text-white/20'}`}>
                  {weekInfo.title}: {weekInfo.subtitle}
                </span>
                <div className={`h-px flex-1 ${isCurrent ? 'bg-emerald-500/20' : 'bg-white/5'}`} />
              </div>

              {/* Cards grid */}
              <div className={`grid gap-3 transition-all duration-700 ${
                isCurrent
                  ? nodes.length <= 3 ? 'grid-cols-3' : nodes.length <= 6 ? 'grid-cols-3 lg:grid-cols-3' : 'grid-cols-3 lg:grid-cols-3'
                  : 'grid-cols-4 lg:grid-cols-6'
              }`}
                style={{ animation: isCurrent && wk === currentWeek ? 'fadeUp 0.6s ease-out' : undefined }}
              >
                {nodes.map(n => (
                  <div key={n.id}>
                    <NodeCard
                      node={n}
                      isBig={isCurrent}
                      isActive={isLinked(n.id)}
                      isHovered={activeNode === n.id}
                      onHover={() => setActiveNode(n.id)}
                      onLeave={() => setActiveNode(null)}
                      showFixed={n.group === 'problem' && currentWeek >= 4}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
