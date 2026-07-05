import React from 'react';
import { HelpCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function ResumeDialog({ onResume, onDiscard }) {
  const { vc, isDark } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl animate-fade-in ${
        isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">Resume Previous Session?</h3>
            <p className={`text-xs ${vc.textSec}`}>We found some unsaved builder progress.</p>
          </div>
        </div>

        <p className={`text-xs leading-relaxed mb-6 ${vc.textSec}`}>
          You can continue right where you left off, or discard the cached history and start a fresh session from scratch.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onResume}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-700 text-white transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Continue Session
          </button>
          <button
            onClick={onDiscard}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
              isDark 
                ? 'border-white/5 bg-gray-900 hover:bg-gray-800 text-gray-300' 
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            Discard & Restart
          </button>
        </div>
      </div>
    </div>
  );
}
