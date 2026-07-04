import React from 'react';
import { Flame } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Circular streak indicator, computed from the user's own check-in
 * timestamps (server/models/Checkin.js getStreak). No external API —
 * replaces the old streak-stats.demolab.com embed.
 */
export default function CheckinStreakRing({ streak = 0, size = 120 }) {
  const { vc, isDark } = useTheme();
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.min(streak, 30); // ring visually fills toward a 30-day milestone
  const progress = target / 30;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={isDark ? '#374151' : '#e5e7eb'}
            strokeWidth="8" fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#f97316"
            strokeWidth="8" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500 mb-0.5" />
          <span className={`text-xl font-bold ${vc.text}`}>{streak}</span>
        </div>
      </div>
      <p className={`text-xs font-medium ${vc.textSec}`}>
        {streak === 0 ? 'Start your streak today' : `day${streak === 1 ? '' : 's'} in a row`}
      </p>
    </div>
  );
}
