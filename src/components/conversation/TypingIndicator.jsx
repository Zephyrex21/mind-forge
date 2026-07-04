import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function TypingIndicator() {
  const { vc } = useTheme();

  return (
    <div className="flex items-center gap-1.5 py-3 px-4 rounded-2xl bg-gray-100 dark:bg-gray-800 max-w-fit animate-pulse">
      <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
