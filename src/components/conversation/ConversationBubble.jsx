import React, { useMemo } from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';

const AssistantAvatar = () => (
  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 select-none shadow-sm">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  </div>
);

const UserAvatar = ({ username, name }) => {
  const initials = useMemo(() => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [name]);

  if (username && username.trim().length > 0) {
    return (
      <img
        src={`https://github.com/${username}.png`}
        alt={username}
        className="w-8 h-8 rounded-xl object-cover shrink-0 select-none shadow-sm border border-gray-200 dark:border-gray-800"
        onError={(e) => {
          // Fallback to initials if GitHub image load fails
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0 select-none shadow-sm">
      {initials}
    </div>
  );
};

export default function ConversationBubble({ message, username, name, children }) {
  const { vc, isDark } = useTheme();
  const isAssistant = message.sender === 'assistant';

  if (isAssistant) {
    return (
      <div className="flex gap-4 items-start w-full animate-fade-in group">
        <AssistantAvatar />
        <div className="flex-1 flex flex-col gap-1 text-left min-w-0">
          <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
            message.isError
              ? 'bg-red-500/10 border border-red-500/20 text-red-500 font-medium'
              : isDark 
                ? 'bg-gray-900 border border-gray-800/40 text-gray-100' 
                : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
          }`}>
            {message.text}
          </div>
          {children && <div className="mt-2 w-full">{children}</div>}
        </div>
      </div>
    );
  }

  // User message
  return (
    <div className="flex gap-4 items-start justify-end w-full animate-fade-in text-right">
      <div className="flex-1 flex flex-col gap-1 items-end min-w-0">
        <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed text-left ${
          message.isCommand
            ? 'bg-indigo-50/50 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-mono text-xs'
            : 'bg-indigo-500 text-white shadow-sm font-medium'
        }`}>
          {message.text}
        </div>
      </div>
      <UserAvatar username={username} name={name} />
    </div>
  );
}
