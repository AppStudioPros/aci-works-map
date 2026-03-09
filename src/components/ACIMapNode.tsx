'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import LordIcon from './LordIcon';

interface ACINodeData {
  label: string;
  subtitle: string;
  detail: string;
  stat?: string;
  icon: string;
  iconSrc?: string;
  color: string;
  nodeType: 'ceo' | 'brain' | 'tool' | 'problem' | 'suggestion' | 'solution';
  showFixed?: boolean;
  fixedHeight?: number;
  fixedWidth?: number;
  [key: string]: unknown;
}

function ACIMapNode({ data }: { data: ACINodeData }) {
  const { label, subtitle, detail, stat, icon, iconSrc, color, nodeType, showFixed, fixedHeight, fixedWidth } = data;
  const borderColor = showFixed ? '#34d399' : color;
  const isAnchor = nodeType === 'ceo' || nodeType === 'brain';

  return (
    <div style={fixedWidth ? { width: fixedWidth, maxWidth: fixedWidth, minWidth: fixedWidth } : {}} className={fixedWidth ? 'overflow-hidden' : isAnchor ? 'w-[200px]' : 'min-w-[160px] max-w-[200px]'}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-white/20 !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-white/20 !border-0" />

      <div
        className="rounded-xl border overflow-hidden bg-[#0D1225]/90 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03]"
        style={{ borderColor: `${borderColor}35`, boxShadow: `0 0 12px ${borderColor}15` }}
      >
        {/* Header */}
        <div
          className={`${fixedHeight && fixedHeight < 30 ? 'px-2 py-0.5' : 'px-3 py-2'} flex items-center justify-between`}
          style={{ background: `linear-gradient(135deg, ${borderColor}18, transparent)` }}
        >
          <div className="flex items-center gap-2">
            <div className={`${fixedHeight && fixedHeight <= 20 ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'} rounded-full flex-shrink-0`} style={{ backgroundColor: borderColor }} />
            <span className={`${fixedHeight && fixedHeight <= 20 ? 'text-[7px]' : isAnchor ? 'text-[13px]' : 'text-[12px]'} font-semibold text-white`}>
              {showFixed ? '\u2705 ' : ''}{label}
            </span>
          </div>
          {iconSrc ? (
            <LordIcon src={iconSrc} trigger="hover" size={isAnchor ? 28 : 24} colors={`primary:${borderColor},secondary:${borderColor}`} />
          ) : icon ? (
            <span className={`${isAnchor ? 'text-lg' : 'text-base'}`}>{showFixed ? '\u2705' : icon}</span>
          ) : null}
        </div>

        {/* Subtitle */}
        <div className="px-3 py-1.5 border-t" style={{ borderColor: `${borderColor}12` }}>
          <div className="text-[9px] text-white/25 uppercase tracking-wider">
            {showFixed ? 'Resolved' : nodeType === 'tool' ? 'Integration' : nodeType === 'problem' ? 'Issue Found' : nodeType === 'suggestion' ? 'Recommendation' : nodeType === 'solution' ? 'Deployed' : 'Control'}
          </div>
          <div className="text-[11px] text-white/55 font-medium">{showFixed ? 'Problem resolved \u2713' : subtitle}</div>
        </div>

        {/* Detail */}
        <div className="px-3 py-1.5 border-t" style={{ borderColor: `${borderColor}08` }}>
          <div className="text-[9px] text-white/35 leading-relaxed">{detail}</div>
        </div>

        {/* Stat */}
        {stat && (
          <div className="px-3 py-1.5 border-t" style={{ borderColor: `${borderColor}10` }}>
            <span className="text-[9px] font-bold" style={{ color: showFixed ? '#34d399' : borderColor }}>
              {showFixed ? '\u2705 Fixed' : stat}
            </span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-white/20 !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-white/20 !border-0" />
    </div>
  );
}

export default memo(ACIMapNode);
