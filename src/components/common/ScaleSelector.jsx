import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * 1-5 scale picker used for mood/energy/sleep-quality ratings.
 */
export default function ScaleSelector({ label, value, onChange, labels }) {
  const { vc, isDark } = useTheme();

  return (
    <div className="mb-5">
      <label className={`block text-sm font-medium mb-2 ${vc.text}`}>{label}</label>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            aria-label={`${n} - ${labels[n - 1]}`}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
              value === n ? vc.selectedCard : `${vc.card} border-transparent hover:shadow-sm`
            }`}
          >
            <span className={`text-base font-bold ${value === n ? 'text-indigo-500' : vc.text}`}>{n}</span>
            <span className={`text-[9px] leading-tight text-center px-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {labels[n - 1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
