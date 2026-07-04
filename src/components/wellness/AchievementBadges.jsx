import React from 'react';
import { Sparkles, Flame, BookOpen, Trophy, Star, Award } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Simple rule-based achievement badges computed from the user's own
 * check-in stats — no external trophy-image API, just local logic.
 */
const BADGE_RULES = [
  { id: 'first', name: 'First Reflection', icon: Sparkles, test: (s) => s.totalCheckins >= 1 },
  { id: 'streak3', name: '3-Day Streak', icon: Flame, test: (s) => s.currentStreak >= 3 },
  { id: 'streak7', name: '7-Day Streak', icon: Flame, test: (s) => s.currentStreak >= 7 },
  { id: 'streak30', name: '30-Day Streak', icon: Trophy, test: (s) => s.currentStreak >= 30 },
  { id: 'ten', name: '10 Check-ins Logged', icon: BookOpen, test: (s) => s.totalCheckins >= 10 },
  { id: 'fifty', name: '50 Check-ins Logged', icon: Award, test: (s) => s.totalCheckins >= 50 },
  { id: 'steady', name: 'Steady Mood Week', icon: Star, test: (s) => (s.avgMood ?? 0) >= 4 },
];

export default function AchievementBadges({ stats }) {
  const { vc, isDark } = useTheme();
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {BADGE_RULES.map(({ id, name, icon: Icon, test }) => {
        const unlocked = test(stats);
        return (
          <div
            key={id}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
              unlocked
                ? isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
                : isDark ? 'bg-gray-900/30 border-gray-800 opacity-40' : 'bg-gray-50 border-gray-150 opacity-50'
            }`}
          >
            <Icon className={`w-5 h-5 ${unlocked ? 'text-indigo-500' : vc.textSec}`} />
            <p className={`text-[11px] font-semibold leading-tight ${vc.text}`}>{name}</p>
          </div>
        );
      })}
    </div>
  );
}
