import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';
import {
  Clock, CheckCircle2, MessageSquare, User,
  Smile, HeartHandshake, Target, Trophy, Sparkles, FileText,
} from 'lucide-react';

const SECTIONS = [
  { key: 'About You', label: 'About You', icon: User },
  { key: 'Mood & Energy', label: 'Mood & Energy', icon: Smile },
  { key: 'Coping Tools', label: 'Coping Tools', icon: HeartHandshake },
  { key: 'Wellness Goals', label: 'Goals', icon: Target },
  { key: 'Milestones', label: 'Milestones', icon: Trophy },
  { key: 'Gratitude', label: 'Gratitude', icon: Sparkles },
  { key: 'Custom Notes', label: 'Custom Notes', icon: FileText },
  { key: 'Preview', label: 'Review & Reflect', icon: CheckCircle2 }
];

export default function ConversationSidebar({ progress, currentSection, onJumpToSection }) {
  const { vc, isDark } = useTheme();

  return (
    <aside className={`w-64 border-r shrink-0 hidden md:flex flex-col h-full transition-colors duration-300 ${
      isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50/50'
    }`}>
      {/* 1. Progress Overview */}
      <div className="p-5 border-b border-gray-300 dark:border-gray-800 space-y-4 text-left">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Progress Overview</h3>
        
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold text-indigo-500 tracking-tight font-mono">{progress.percentage}%</span>
            <span className={`text-[10px] font-bold ${vc.textSec}`}>
              {progress.total - progress.remaining} of {progress.total} steps
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <div className="p-2.5 rounded-xl bg-gray-200/40 dark:bg-gray-900 border border-gray-200/20 dark:border-white/5 space-y-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <div className="text-[9px] font-bold text-gray-500">EST. TIME</div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-300">{progress.estimatedTimeStr || '3 mins'}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-200/40 dark:bg-gray-900 border border-gray-200/20 dark:border-white/5 space-y-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <div className="text-[9px] font-bold text-gray-500">REMAINING</div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-300">{progress.remaining} steps</div>
          </div>
        </div>
      </div>

      {/* 2. Section Milestones Checklist */}
      <div className="flex-1 overflow-y-auto p-5 text-left space-y-3.5">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Milestones</h3>
        <nav className="space-y-1.5">
          {SECTIONS.map((sec, idx) => {
            const Icon = sec.icon;
            
            // Map active question sections to highlight the current step
            const isActive = currentSection === sec.key || 
              (sec.key === 'Preview' && currentSection === 'Preview');
            
            return (
              <div
                key={sec.key}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold select-none border transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-500'
                    : 'bg-transparent border-transparent text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-indigo-500' : 'text-gray-400'
                }`} />
                <span className="truncate flex-1">{sec.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
