import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Reusable toggle switch with label.
 */
export default function ToggleSwitch({ label, value, onChange }) {
  const { vc, isDark } = useTheme();

  return (
    <div className="flex items-center justify-between mb-4">
      <span className={`text-sm font-medium ${vc.text}`}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all relative ${
          value ? 'bg-green-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            value ? 'left-6' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
