'use client';

import { useState, useEffect, useRef } from 'react';

interface Node {
  id: string;
  label: string;
  ring: 'center' | 'inner' | 'outer';
  angle: number;
  description: string;
  icon: string;
}

const nodes: Node[] = [
  { id: 'aci', label: 'ACI', ring: 'center', angle: 0, description: 'Adaptive Compound Intelligence — the brain of your organization', icon: '🧠' },
  { id: 'individual', label: 'Individual\nIntelligence', ring: 'inner', angle: 0, description: 'Learns how each person thinks, communicates, and works best', icon: '👤' },
  { id: 'knowledge', label: 'Knowledge\nExtraction', ring: 'inner', angle: 72, description: 'Continuously extracts insights from every interaction and document', icon: '⚡' },
  { id: 'memory', label: 'Org\nMemory', ring: 'inner', angle: 144, description: 'Persistent organizational knowledge that never gets lost', icon: '💾' },
  { id: 'compound', label: 'Compound\nReasoning', ring: 'inner', angle: 216, description: 'Connects insights across people and departments others would miss', icon: '🔗' },
  { id: 'permissions', label: 'Permission\n& Delivery', ring: 'inner', angle: 288, description: 'Right information, right person, right time — with proper access control', icon: '🛡️' },
  { id: 'email', label: 'Email', ring: 'outer', angle: 0, description: 'Monitors and learns from email patterns and communications', icon: '📧' },
  { id: 'calendar', label: 'Calendar', ring: 'outer', angle: 36, description: 'Meeting intelligence — prep, summaries, action items', icon: '📅' },
  { id: 'messaging', label: 'Messaging', ring: 'outer', angle: 72, description: 'Slack, Teams, Discord — wherever your team talks', icon: '💬' },
  { id: 'documents', label: 'Documents', ring: 'outer', angle: 108, description: 'Processes and understands every doc, spreadsheet, and report', icon: '📄' },
  { id: 'meetings', label: 'Meetings', ring: 'outer', angle: 144, description: 'Live meeting support, transcription, and follow-up automation', icon: '🎙️' },
  { id: 'hr', label: 'HR\nSystems', ring: 'outer', angle: 180, description: 'Onboarding, offboarding, team dynamics, culture health', icon: '👥' },
  { id: 'projects', label: 'Project\nTools', ring: 'outer', angle: 216, description: 'Jira, Asana, Linear — task and project intelligence', icon: '📋' },
  { id: 'analytics', label: 'Analytics', ring: 'outer', angle: 252, description: 'Business metrics, KPIs, and trend detection', icon: '📊' },
  { id: 'security', label: 'Security', ring: 'outer', angle: 288, description: 'Threat monitoring, access patterns, compliance tracking', icon: '🔒' },
  { id: 'crm', label: 'CRM', ring: 'outer', angle: 324, description: 'Customer relationships, pipeline intelligence, deal patterns', icon: '🤝' },
];

const connections: [string, string][] = [
  ['aci', 'individual'], ['aci', 'knowledge'], ['aci', 'memory'], ['aci', 'compound'], ['aci', 'permissions'],
  ['individual', 'email'], ['individual', 'messaging'], ['individual', 'calendar'],
  ['knowledge', 'documents'], ['knowledge', 'meetings'], ['knowledge', 'messaging'],
  ['memory', 'documents'], ['memory', 'hr'], ['memory', 'projects'],
  ['compound', 'analytics'], ['compound', 'crm'], ['compound', 'projects'],
  ['permissions', 'security'], ['permissions', 'hr'], ['permissions', 'email'],
];

function getNodePosition(node: Node, centerX: number, centerY: number, innerRadius: number, outerRadius: number) {
  if (node.ring === 'center') return { x: centerX, y: centerY };
  const radius = node.ring === 'inner' ? innerRadius : outerRadius;
  const angleRad = ((node.angle - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad),
  };
}

export default function ACINodeMap() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 900 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth, 900);
        setDimensions({ width: w, height: w });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { width, height } = dimensions;
  const centerX = width / 2;
  const centerY = height / 2;
  const innerRadius = width * 0.22;
  const outerRadius = width * 0.42;

  const nodePositions = new Map<string, { x: number; y: number }>();
  nodes.forEach(n => {
    nodePositions.set(n.id, getNodePosition(n, centerX, centerY, innerRadius, outerRadius));
  });

  const isConnectedToActive = (nodeId: string) => {
    if (!activeNode) return false;
    return connections.some(
      ([a, b]) => (a === activeNode && b === nodeId) || (b === activeNode && a === nodeId)
    ) || nodeId === activeNode;
  };

  // Seed-based random for consistent pulse delays
  const pulseDelays = useRef(connections.map((_, i) => i * 0.7));
  const pulseDurations = useRef(connections.map(() => 2 + Math.random() * 2));

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] mx-auto" style={{ aspectRatio: '1' }}>
      {/* SVG connections layer */}
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ring outlines */}
        <circle cx={centerX} cy={centerY} r={innerRadius} fill="none" stroke="#1a3a2a" strokeWidth="1" opacity="0.3" strokeDasharray="4 4" />
        <circle cx={centerX} cy={centerY} r={outerRadius} fill="none" stroke="#1a3a2a" strokeWidth="1" opacity="0.2" strokeDasharray="4 4" />

        {/* Connection lines */}
        {connections.map(([fromId, toId], i) => {
          const from = nodePositions.get(fromId)!;
          const to = nodePositions.get(toId)!;
          const isActive = !activeNode || (isConnectedToActive(fromId) && isConnectedToActive(toId));
          return (
            <g key={`${fromId}-${toId}`}>
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={isActive ? '#00ff88' : '#1a3a2a'}
                strokeWidth={isActive ? 1.5 : 0.5}
                opacity={isActive ? 0.5 : 0.15}
                style={{ transition: 'all 0.5s ease' }}
              />
              {isActive && (
                <circle r="3" fill="#00ff88" opacity="0" filter="url(#glow)">
                  <animateMotion
                    dur={`${pulseDurations.current[i]}s`}
                    repeatCount="indefinite"
                    begin={`${pulseDelays.current[i]}s`}
                    path={`M${from.x},${from.y} L${to.x},${to.y}`}
                  />
                  <animate attributeName="opacity" values="0;0.9;0.9;0" dur={`${pulseDurations.current[i]}s`} repeatCount="indefinite" begin={`${pulseDelays.current[i]}s`} />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes layer */}
      {nodes.map((node) => {
        const pos = nodePositions.get(node.id)!;
        const isActive = !activeNode || isConnectedToActive(node.id);
        const isCenter = node.ring === 'center';
        const isInner = node.ring === 'inner';
        const size = isCenter ? width * 0.13 : isInner ? width * 0.1 : width * 0.08;

        return (
          <div
            key={node.id}
            className="absolute flex flex-col items-center justify-center cursor-pointer"
            style={{
              left: pos.x - size / 2,
              top: pos.y - size / 2,
              width: size,
              height: size,
              transition: 'all 0.5s ease',
              opacity: isActive ? 1 : 0.25,
              transform: activeNode === node.id ? 'scale(1.15)' : 'scale(1)',
              zIndex: activeNode === node.id ? 20 : 10,
            }}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
            onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
          >
            <div
              className={`rounded-full flex flex-col items-center justify-center text-center w-full h-full
                ${isCenter
                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-[0_0_30px_rgba(0,255,136,0.4)]'
                  : isInner
                    ? 'bg-gradient-to-br from-[#13251e] to-[#1a4a35] border border-emerald-500/30 shadow-[0_0_15px_rgba(0,255,136,0.15)]'
                    : 'bg-[#0d1f17] border border-emerald-500/20 shadow-[0_0_10px_rgba(0,255,136,0.1)]'
                }`}
            >
              <span className={`${isCenter ? 'text-2xl' : isInner ? 'text-lg' : 'text-base'}`}>
                {node.icon}
              </span>
              <span
                className={`font-semibold whitespace-pre-line leading-tight mt-1
                  ${isCenter ? 'text-white text-sm' : isInner ? 'text-emerald-300 text-[10px]' : 'text-emerald-400/80 text-[9px]'}`}
              >
                {node.label}
              </span>
            </div>

            {/* Tooltip */}
            {activeNode === node.id && (
              <div
                className="absolute z-30 bg-[#0a1a12] border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-100 max-w-[220px] text-center shadow-[0_0_20px_rgba(0,255,136,0.2)] pointer-events-none"
                style={{
                  top: pos.y < height / 2 ? '110%' : 'auto',
                  bottom: pos.y >= height / 2 ? '110%' : 'auto',
                }}
              >
                {node.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
