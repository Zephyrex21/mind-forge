import React from 'react';
import { Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useGenerator } from '../../hooks/useGenerator';

/**
 * Top navigation bar with progress indicator, theme toggle, and settings.
 */
export default function TopBar() {
  const { vc, isDark, toggleTheme } = useTheme();
  const { steps, currentStepIndex, setSettingsOpen } = useGenerator();

  const totalSteps = steps.length;
  const displayStepNum = currentStepIndex + 1;

  return (
    <div className={`sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b ${vc.surface} backdrop-blur-md`}>
      <div className="flex items-center gap-2">
        <img src="/favicon.png" alt="Logo" className="w-5 h-5 object-contain rounded-md" />
        <span className={`font-bold text-sm ${vc.text}`}>MindForge</span>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < displayStepNum ? vc.progress : isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className={`text-xs whitespace-nowrap ${vc.textSec}`}>
            Step {displayStepNum} of {totalSteps}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          className={`p-2 rounded-lg transition-all hover:opacity-70 ${vc.text}`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className={`p-2 rounded-lg transition-all hover:opacity-70 ${vc.text}`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
