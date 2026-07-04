import React from 'react';
import { Smile, ArrowRight } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function SuggestionCards({ onSelectAction }) {
  const { vc, isDark } = useTheme();

  return (
    <div className="mt-6 max-w-md w-full">
      <button
        onClick={() => onSelectAction()}
        className={`w-full p-5 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 ${
          isDark ? 'bg-gray-900 border-gray-800 hover:bg-gray-805 hover:border-gray-700' : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shrink-0">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Start today's check-in</h3>
            <p className={`text-xs leading-relaxed ${vc.textSec}`}>Mood, energy, sleep, and whatever else is on your mind.</p>
          </div>
        </div>
        <ArrowRight className={`w-4 h-4 shrink-0 ${vc.accent}`} />
      </button>
    </div>
  );
}
