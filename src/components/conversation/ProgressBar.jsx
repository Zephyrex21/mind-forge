import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function ProgressBar({ percentage = 0 }) {
  const { vc } = useTheme();

  return (
    <div className="w-full h-1 bg-gray-150 dark:bg-gray-800 overflow-hidden relative">
      <div 
        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
