import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * A small hand-rolled SVG bar chart — same "no charting library" approach
 * as MoodTrendChart, for consistency. Bars are scaled against `domain`
 * (defaults to the 1-5 mood/energy scale used throughout the app).
 */
export default function InsightBarChart({ data = [], domain = [1, 5], height = 140, color = '#6366f1' }) {
  const { vc, isDark } = useTheme();
  const withValues = data.filter((d) => typeof d.value === 'number');

  if (!withValues.length) {
    return (
      <div className={`flex items-center justify-center rounded-xl border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`} style={{ height }}>
        <p className={`text-xs ${vc.textSec}`}>Not enough data yet.</p>
      </div>
    );
  }

  const width = 500;
  const padding = 28;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const n = data.length;
  const barW = (innerW / n) * 0.6;
  const [domainMin, domainMax] = domain;

  const xFor = (i) => padding + (i + 0.5) * (innerW / n);
  const yFor = (val) => padding + innerH - ((val - domainMin) / (domainMax - domainMin)) * innerH;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <line x1={padding} x2={width - padding} y1={yFor(domainMin)} y2={yFor(domainMin)} stroke={isDark ? '#374151' : '#e5e7eb'} strokeWidth="1" />
        {data.map((d, i) => {
          if (typeof d.value !== 'number') return null;
          const barHeight = yFor(domainMin) - yFor(d.value);
          return (
            <rect
              key={d.label}
              x={xFor(i) - barW / 2}
              y={yFor(d.value)}
              width={barW}
              height={Math.max(barHeight, 2)}
              rx={4}
              fill={color}
              opacity={0.85}
            />
          );
        })}
      </svg>
      <div className="flex justify-between mt-1.5 px-1">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            <div className={`text-[10px] font-semibold ${vc.textSec}`}>{d.label}</div>
            <div className={`text-[10px] font-mono ${vc.text}`}>{typeof d.value === 'number' ? d.value : '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
