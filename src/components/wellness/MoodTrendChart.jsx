import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Lightweight hand-rolled SVG line chart — no charting library needed.
 * Plots mood + energy (1-5 scale) over the user's recent check-ins.
 * Replaces the old GitHub-stats-card image embed with data computed
 * entirely from the user's own saved check-ins (server/models/Checkin.js).
 */
export default function MoodTrendChart({ trend = [], height = 180 }) {
  const { vc, isDark } = useTheme();

  if (!trend.length) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`} style={{ height }}>
        <p className={`text-xs ${vc.textSec}`}>Log a few check-ins to see your mood trend here.</p>
      </div>
    );
  }

  const width = 600;
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const n = trend.length;

  const xFor = (i) => padding + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yFor = (val) => padding + innerH - ((val - 1) / 4) * innerH; // scale 1-5

  const linePath = (key) => trend
    .map((t, i) => (typeof t[key] === 'number' ? `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(t[key])}` : null))
    .filter(Boolean)
    .join(' ');

  const gridLines = [1, 2, 3, 4, 5];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {gridLines.map((g) => (
          <line
            key={g}
            x1={padding} x2={width - padding}
            y1={yFor(g)} y2={yFor(g)}
            stroke={isDark ? '#374151' : '#e5e7eb'}
            strokeWidth="1"
          />
        ))}
        <path d={linePath('mood')} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={linePath('energy')} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 4" />
        {trend.map((t, i) => (
          typeof t.mood === 'number' && (
            <circle key={`m-${i}`} cx={xFor(i)} cy={yFor(t.mood)} r="3" fill="#6366f1" />
          )
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <span className={`flex items-center gap-1.5 text-xs ${vc.textSec}`}>
          <span className="w-3 h-0.5 rounded-full bg-indigo-500 inline-block" /> Mood
        </span>
        <span className={`flex items-center gap-1.5 text-xs ${vc.textSec}`}>
          <span className="w-3 h-0.5 rounded-full bg-green-500 inline-block" style={{ borderTop: '2px dashed #22c55e' }} /> Energy
        </span>
      </div>
    </div>
  );
}
