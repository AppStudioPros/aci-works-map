'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────
interface NodeData {
  id: string;
  label: string;
  ring: 'boss' | 'center' | 'inner' | 'outer';
  description: string;
  icon: string;
  phase: number; // which phase this node appears in (1-5)
}

interface Connection {
  from: string;
  to: string;
  hasCheckpoint?: boolean; // human-in-the-loop stop
  phase: number; // which phase this appears in
}

// ── Data ───────────────────────────────────────────────
const nodeData: NodeData[] = [
  // Boss — Phase 1 (always visible)
  { id: 'boss', label: 'YOU', ring: 'boss', description: 'Every decision, every action — ACI confirms with you first. You run the company. ACI powers it.', icon: '👔', phase: 1 },

  // Center brain — Phase 1
  { id: 'aci', label: 'ACI', ring: 'center', description: 'Adaptive Compound Intelligence — the brain of your organization. It learns, connects, and builds.', icon: '🧠', phase: 1 },

  // Inner ring — 5 architecture layers — Phase 2
  { id: 'individual', label: 'Individual Intelligence', ring: 'inner', description: 'Learns how each person thinks, communicates, and works best — then adapts to them.', icon: '👤', phase: 2 },
  { id: 'knowledge', label: 'Knowledge Extraction', ring: 'inner', description: 'Continuously extracts insights from every interaction. Tribal knowledge never dies.', icon: '⚡', phase: 2 },
  { id: 'memory', label: 'Org Memory', ring: 'inner', description: 'Persistent organizational memory. What was decided, why, and by whom — always accessible.', icon: '💾', phase: 2 },
  { id: 'compound', label: 'Compound Reasoning', ring: 'inner', description: 'Connects insights across people and departments that no single person could see.', icon: '🔗', phase: 3 },
  { id: 'permissions', label: 'Permission & Delivery', ring: 'inner', description: 'Right information, right person, right time — with proper access control. Always.', icon: '🛡️', phase: 2 },

  // Outer ring — integrations — Phase 1 (they light up as ACI connects)
  { id: 'email', label: 'Email', ring: 'outer', description: 'Gmail, Outlook, any inbox — ACI learns communication patterns automatically.', icon: '📧', phase: 1 },
  { id: 'calendar', label: 'Calendar', ring: 'outer', description: 'Meeting prep, scheduling intelligence, automatic follow-ups.', icon: '📅', phase: 1 },
  { id: 'messaging', label: 'Messaging', ring: 'outer', description: 'Slack, Teams, Discord — wherever your team talks, ACI listens and learns.', icon: '💬', phase: 1 },
  { id: 'documents', label: 'Documents', ring: 'outer', description: 'Every doc, spreadsheet, report, and wiki — processed and understood.', icon: '📄', phase: 1 },
  { id: 'meetings', label: 'Meetings', ring: 'outer', description: 'Live meeting intelligence — prep briefs, real-time context, action items.', icon: '🎙️', phase: 1 },
  { id: 'hr', label: 'HR Systems', ring: 'outer', description: 'Onboarding, offboarding, team dynamics, culture health — all automated.', icon: '👥', phase: 1 },
  { id: 'projects', label: 'Project Tools', ring: 'outer', description: 'Jira, Asana, Linear — task intelligence and cross-project patterns.', icon: '📋', phase: 1 },
  { id: 'analytics', label: 'Analytics', ring: 'outer', description: 'Business metrics, KPIs, trend detection — insights surfaced proactively.', icon: '📊', phase: 1 },
  { id: 'security', label: 'Security', ring: 'outer', description: 'Threat monitoring, access anomalies, compliance tracking — preemptive.', icon: '🔒', phase: 1 },
  { id: 'crm', label: 'CRM', ring: 'outer', description: 'Customer relationships, deal patterns, pipeline intelligence.', icon: '🤝', phase: 1 },

  // Phase 4 — Custom-built nodes (emerge from center)
  { id: 'custom1', label: 'Custom Workflow', ring: 'inner', description: 'ACI built this automation based on patterns it observed in YOUR company. No two are alike.', icon: '⚙️', phase: 4 },
  { id: 'custom2', label: 'Custom Reports', ring: 'inner', description: 'Reports designed around how YOUR team actually makes decisions — not generic templates.', icon: '📈', phase: 4 },
  { id: 'custom3', label: 'Custom Alerts', ring: 'inner', description: 'Proactive notifications tuned to what matters to YOUR business. Zero noise.', icon: '🔔', phase: 4 },
];

const connectionData: Connection[] = [
  // Boss ↔ ACI (always, gold)
  { from: 'boss', to: 'aci', phase: 1 },

  // ACI ↔ Inner ring
  { from: 'aci', to: 'individual', hasCheckpoint: true, phase: 2 },
  { from: 'aci', to: 'knowledge', phase: 2 },
  { from: 'aci', to: 'memory', phase: 2 },
  { from: 'aci', to: 'compound', phase: 3 },
  { from: 'aci', to: 'permissions', hasCheckpoint: true, phase: 2 },

  // Inner ↔ Outer
  { from: 'individual', to: 'email', phase: 2 },
  { from: 'individual', to: 'messaging', phase: 2 },
  { from: 'individual', to: 'calendar', phase: 2 },
  { from: 'knowledge', to: 'documents', phase: 2 },
  { from: 'knowledge', to: 'meetings', phase: 2 },
  { from: 'knowledge', to: 'messaging', phase: 2 },
  { from: 'memory', to: 'documents', phase: 2 },
  { from: 'memory', to: 'hr', phase: 2 },
  { from: 'memory', to: 'projects', phase: 2 },
  { from: 'compound', to: 'analytics', phase: 3 },
  { from: 'compound', to: 'crm', phase: 3 },
  { from: 'compound', to: 'projects', phase: 3 },
  { from: 'permissions', to: 'security', hasCheckpoint: true, phase: 2 },
  { from: 'permissions', to: 'hr', hasCheckpoint: true, phase: 2 },
  { from: 'permissions', to: 'email', phase: 2 },

  // Cross-connections (Phase 3 — the "aha" connections)
  { from: 'email', to: 'crm', phase: 3 },
  { from: 'calendar', to: 'meetings', phase: 3 },
  { from: 'hr', to: 'security', phase: 3 },
  { from: 'analytics', to: 'documents', phase: 3 },

  // Custom nodes (Phase 4)
  { from: 'aci', to: 'custom1', phase: 4 },
  { from: 'aci', to: 'custom2', phase: 4 },
  { from: 'aci', to: 'custom3', hasCheckpoint: true, phase: 4 },
];

const phases = [
  { id: 1, title: 'ACI Arrives', subtitle: 'Day 1', description: 'ACI plugs into what you already use. No migration. No training. No disruption.' },
  { id: 2, title: 'ACI Learns', subtitle: 'Week 1–4', description: 'ACI watches how your company actually works. Not how you think it works.' },
  { id: 3, title: 'ACI Connects', subtitle: 'Month 1–2', description: 'ACI sees patterns across your entire organization that no single person could.' },
  { id: 4, title: 'ACI Builds', subtitle: 'Month 2+', description: "ACI doesn't give you a program. It builds YOUR program." },
  { id: 5, title: 'ACI Compounds', subtitle: 'Ongoing', description: 'The longer ACI runs, the smarter your entire organization gets.' },
];

// ── Layout ─────────────────────────────────────────────
function getPositions(width: number, height: number) {
  const centerX = width / 2;
  const centerY = height * 0.5;
  const innerRadius = Math.min(width, height) * 0.2;
  const outerRadius = Math.min(width, height) * 0.4;

  const positions = new Map<string, { x: number; y: number }>();

  // Boss above center
  positions.set('boss', { x: centerX, y: height * 0.08 });
  // ACI center
  positions.set('aci', { x: centerX, y: centerY });

  // Inner ring — 5 core + 3 custom
  const innerNodes = ['individual', 'knowledge', 'memory', 'compound', 'permissions'];
  innerNodes.forEach((id, i) => {
    const angle = ((i * 72) - 90) * Math.PI / 180;
    positions.set(id, {
      x: centerX + innerRadius * Math.cos(angle),
      y: centerY + innerRadius * Math.sin(angle),
    });
  });

  // Custom nodes — appear between inner and center
  const customRadius = innerRadius * 0.55;
  const customAngles = [30, 150, 270];
  ['custom1', 'custom2', 'custom3'].forEach((id, i) => {
    const angle = (customAngles[i] - 90) * Math.PI / 180;
    positions.set(id, {
      x: centerX + customRadius * Math.cos(angle),
      y: centerY + customRadius * Math.sin(angle),
    });
  });

  // Outer ring — 10 nodes
  const outerNodes = ['email', 'calendar', 'messaging', 'documents', 'meetings', 'hr', 'projects', 'analytics', 'security', 'crm'];
  outerNodes.forEach((id, i) => {
    const angle = ((i * 36) - 90) * Math.PI / 180;
    positions.set(id, {
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle),
    });
  });

  return positions;
}

// ── Component ──────────────────────────────────────────
export default function ACINodeMap() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 900, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth, 900);
        setDimensions({ width: w, height: w * 0.88 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const playStory = useCallback(() => {
    setIsPlaying(true);
    setCurrentPhase(1);
    let phase = 1;
    playTimerRef.current = setInterval(() => {
      phase++;
      if (phase > 5) {
        if (playTimerRef.current) clearInterval(playTimerRef.current);
        setIsPlaying(false);
        return;
      }
      setCurrentPhase(phase);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, []);

  const { width, height } = dimensions;
  const positions = getPositions(width, height);

  const visibleNodes = nodeData.filter(n => n.phase <= currentPhase);
  const visibleConnections = connectionData.filter(c => c.phase <= currentPhase);

  const isConnectedToActive = (nodeId: string) => {
    if (!activeNode) return true;
    return connectionData.some(
      c => (c.from === activeNode && c.to === nodeId) || (c.to === activeNode && c.from === nodeId)
    ) || nodeId === activeNode;
  };

  const currentPhaseData = phases.find(p => p.id === currentPhase)!;

  // Box sizes
  const getNodeSize = (ring: string) => {
    const base = Math.min(width, height);
    if (ring === 'boss') return { w: base * 0.14, h: base * 0.065 };
    if (ring === 'center') return { w: base * 0.13, h: base * 0.065 };
    if (ring === 'inner') return { w: base * 0.12, h: base * 0.058 };
    return { w: base * 0.1, h: base * 0.052 };
  };

  return (
    <div className="w-full max-w-[960px] mx-auto">
      {/* Phase controls */}
      <div className="flex flex-col items-center mb-8">
        {/* Phase indicators */}
        <div className="flex items-center gap-2 mb-4">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => { setCurrentPhase(phase.id); setIsPlaying(false); if (playTimerRef.current) clearInterval(playTimerRef.current); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-500 ${
                currentPhase >= phase.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-white/30 border border-white/10'
              } ${currentPhase === phase.id ? 'ring-1 ring-emerald-400/50 scale-105' : ''}`}
            >
              {phase.subtitle}
            </button>
          ))}
        </div>

        {/* Current phase info */}
        <div className="text-center transition-all duration-700">
          <h2 className="text-2xl font-bold text-white mb-1">
            {currentPhaseData.title}
            <span className="text-emerald-400/60 text-lg ml-2">— {currentPhaseData.subtitle}</span>
          </h2>
          <p className="text-emerald-300/50 text-sm max-w-lg">{currentPhaseData.description}</p>
        </div>

        {/* Play button */}
        <button
          onClick={playStory}
          disabled={isPlaying}
          className={`mt-4 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            isPlaying
              ? 'bg-emerald-500/10 text-emerald-300/50 cursor-not-allowed'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 hover:scale-105'
          }`}
        >
          {isPlaying ? '▶ Playing...' : '▶ Watch the Story'}
        </button>
      </div>

      {/* Map */}
      <div ref={containerRef} className="relative w-full" style={{ height: height }}>
        {/* SVG layer — connections */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ring guides */}
          <circle cx={width/2} cy={height*0.5} r={Math.min(width,height)*0.2} fill="none" stroke="#1a3a2a" strokeWidth="1" opacity="0.2" strokeDasharray="6 4" />
          <circle cx={width/2} cy={height*0.5} r={Math.min(width,height)*0.4} fill="none" stroke="#1a3a2a" strokeWidth="1" opacity="0.15" strokeDasharray="6 4" />

          {/* Connections */}
          {visibleConnections.map((conn, i) => {
            const from = positions.get(conn.from);
            const to = positions.get(conn.to);
            if (!from || !to) return null;

            const isBossLine = conn.from === 'boss' || conn.to === 'boss';
            const isActive = !activeNode || (isConnectedToActive(conn.from) && isConnectedToActive(conn.to));
            const lineColor = isBossLine ? '#e09f18' : conn.hasCheckpoint ? '#e09f18' : '#00ff88';
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            return (
              <g key={`${conn.from}-${conn.to}`} style={{ transition: 'opacity 0.8s ease' }} opacity={isActive ? 1 : 0.15}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={lineColor}
                  strokeWidth={isBossLine ? 2.5 : 1.2}
                  opacity={0.4}
                  className="animate-fade-in"
                />
                {/* Data pulse */}
                <circle r={isBossLine ? 4 : 2.5} fill={lineColor} opacity="0" filter="url(#glow2)">
                  <animateMotion
                    dur={`${2.5 + (i % 3)}s`}
                    repeatCount="indefinite"
                    begin={`${i * 0.4}s`}
                    path={`M${from.x},${from.y} L${to.x},${to.y}`}
                  />
                  <animate attributeName="opacity" values="0;0.8;0.8;0" dur={`${2.5 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.4}s` } />
                </circle>
                {/* Checkpoint icon */}
                {conn.hasCheckpoint && (
                  <g>
                    <circle cx={midX} cy={midY} r="8" fill="#0a1a12" stroke="#e09f18" strokeWidth="1.5" />
                    <text x={midX} y={midY + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#e09f18">✋</text>
                    {/* Checkpoint tooltip on hover would need JS — handled in node layer */}
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes layer */}
        {visibleNodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const size = getNodeSize(node.ring);
          const isActive = !activeNode || isConnectedToActive(node.id);
          const isBoss = node.ring === 'boss';
          const isCenter = node.ring === 'center';
          const isCustom = node.id.startsWith('custom');

          return (
            <div
              key={node.id}
              className="absolute transition-all duration-700 ease-out cursor-pointer"
              style={{
                left: pos.x - size.w / 2,
                top: pos.y - size.h / 2,
                width: size.w,
                height: size.h,
                opacity: isActive ? 1 : 0.2,
                transform: activeNode === node.id ? 'scale(1.1)' : 'scale(1)',
                zIndex: activeNode === node.id ? 30 : isBoss ? 25 : isCenter ? 20 : 10,
                animation: node.phase === currentPhase ? 'nodeAppear 0.8s ease-out' : undefined,
              }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              {/* Box node */}
              <div
                className={`w-full h-full rounded-xl flex items-center gap-2 px-3 transition-all duration-500 ${
                  isBoss
                    ? 'bg-gradient-to-r from-[#2a1f0a] to-[#1a1508] border-2 border-[#e09f18]/60 shadow-[0_0_25px_rgba(224,159,24,0.3)]'
                    : isCenter
                      ? 'bg-gradient-to-r from-emerald-600/40 to-cyan-600/30 border-2 border-emerald-400/50 shadow-[0_0_30px_rgba(0,255,136,0.3)]'
                      : isCustom
                        ? 'bg-gradient-to-r from-purple-900/30 to-emerald-900/30 border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : node.ring === 'inner'
                          ? 'bg-gradient-to-r from-[#0d2118] to-[#0a1a12] border border-emerald-500/25 shadow-[0_0_12px_rgba(0,255,136,0.1)]'
                          : 'bg-[#0a1510] border border-emerald-500/15 shadow-[0_0_8px_rgba(0,255,136,0.08)]'
                }`}
              >
                <span className={`flex-shrink-0 ${isBoss || isCenter ? 'text-xl' : 'text-base'}`}>
                  {node.icon}
                </span>
                <span className={`font-semibold leading-tight truncate ${
                  isBoss ? 'text-[#e09f18] text-xs' :
                  isCenter ? 'text-white text-xs' :
                  isCustom ? 'text-purple-300 text-[10px]' :
                  node.ring === 'inner' ? 'text-emerald-300 text-[10px]' :
                  'text-emerald-400/70 text-[9px]'
                }`}>
                  {node.label}
                </span>
              </div>

              {/* Tooltip */}
              {activeNode === node.id && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-40 bg-[#0a1a12] border border-emerald-500/30 rounded-lg px-4 py-3 text-xs text-emerald-100 w-[220px] text-center shadow-[0_0_20px_rgba(0,255,136,0.2)] pointer-events-none"
                  style={{
                    top: pos.y < height * 0.4 ? '115%' : 'auto',
                    bottom: pos.y >= height * 0.4 ? '115%' : 'auto',
                  }}
                >
                  {node.description}
                </div>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 right-4 flex flex-col gap-1.5 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-emerald-500/60"></div>
            <span className="text-emerald-400/50">Data flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#e09f18]/60"></div>
            <span className="text-[#e09f18]/50">Human approval required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px]">✋</span>
            <span className="text-[#e09f18]/50">Human-in-the-loop checkpoint</span>
          </div>
        </div>
      </div>

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes nodeAppear {
          0% { opacity: 0; transform: scale(0.5); }
          50% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
