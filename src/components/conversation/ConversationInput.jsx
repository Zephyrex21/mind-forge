import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function ConversationInput({ onSubmit, disabled, placeholder = 'Type a message or command (e.g. /back, /skip, /restart)...' }) {
  const { vc, isDark } = useTheme();
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    
    // Cap height at 200px
    textarea.style.height = `${Math.min(200, scrollHeight)}px`;
  }, [text]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;

    onSubmit(text);
    setText('');
    
    // Focus back on textarea after submission
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e) => {
    // Send on Enter, allow line breaks with Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = !text.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div className={`flex items-end gap-2 p-2 rounded-2xl border transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${
        isDark 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 max-h-[200px] min-h-[40px] px-3.5 py-2.5 outline-none resize-none bg-transparent text-sm leading-relaxed border-0 ring-0 focus:ring-0 focus:border-0 ${
            isDark ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
          }`}
          style={{ height: 'auto' }}
        />

        <div className="flex items-center gap-1.5 px-2 py-1 shrink-0">
          <span className={`text-[10px] hidden sm:inline-flex items-center gap-0.5 select-none font-mono ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Enter <CornerDownLeft className="w-2.5 h-2.5" />
          </span>

          <button
            type="submit"
            disabled={isEmpty || disabled}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isEmpty || disabled
                ? isDark 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white active:scale-95'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className={`text-[10px] mt-1.5 text-center ${vc.textSec}`}>
        Commands: <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">/back</code> to undo, <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">/skip</code> to pass optional, <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">/restart</code> to reset.
      </p>
    </form>
  );
}
