import React from 'react';
import { ArrowLeft, Settings, MessageSquare, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function ConversationHeader({ title, subTitle, onOpenSettings }) {
  const { vc, isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <header className={`border-b shrink-0 px-6 py-4 flex items-center justify-between transition-colors duration-300 ${
      isDark ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'
    } backdrop-blur-md sticky top-0 z-30`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className={`p-2 rounded-lg border transition-colors ${
            isDark 
              ? 'border-gray-800 bg-gray-900 hover:text-white text-gray-400' 
              : 'border-gray-200 bg-white hover:text-gray-950 text-gray-500 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-left">
          <h1 className="text-sm font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            {title}
          </h1>
          <p className="text-[10px] text-gray-500">{subTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className={`p-2 rounded-lg border transition-colors ${
            isDark 
              ? 'border-gray-800 bg-gray-900 hover:text-white text-gray-400' 
              : 'border-gray-200 bg-white hover:text-gray-950 text-gray-500 shadow-sm'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
