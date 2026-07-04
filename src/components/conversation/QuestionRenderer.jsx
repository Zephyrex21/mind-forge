import React, { useState } from 'react';
import { ArrowRight, HeartHandshake } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function QuestionRenderer({ question, generator, onSubmit }) {
  const { vc, isDark } = useTheme();
  const { formData, updateForm } = generator;

  if (!question) return null;

  // 1. DROPDOWN RENDERER (also used for 1-5 scale questions)
  if (question.component === 'Dropdown') {
    const options = question.options || [];
    return (
      <div className="flex flex-wrap gap-2.5 mt-2 animate-fade-in">
        {options.map(opt => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          return (
            <button
              key={value}
              onClick={() => onSubmit(value, label)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 hover:scale-102 active:scale-95 ${
                isDark
                  ? 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
                  : 'bg-white border-gray-200 text-gray-750 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  // 2. TOGGLE RENDERER
  if (question.component === 'Toggle') {
    return (
      <div className="flex gap-3 mt-2 animate-fade-in">
        <button
          onClick={() => onSubmit(true, 'Yes')}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-650 text-white transition-colors"
        >
          Yes
        </button>
        <button
          onClick={() => onSubmit(false, 'No')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
            isDark ? 'border-gray-800 bg-gray-900 hover:bg-gray-850 text-gray-300' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
          }`}
        >
          No
        </button>
      </div>
    );
  }

  // 3. MULTI SELECT RENDERER (coping tools)
  if (question.component === 'Multi Select') {
    const options = question.options || [];
    const selected = formData.copingTools || [];

    const toggle = (opt) => {
      updateForm('copingTools', selected.includes(opt) ? selected.filter(t => t !== opt) : [...selected, opt]);
    };

    const handleConfirm = () => {
      onSubmit(selected, selected.length ? selected.join(', ') : 'None selected');
    };

    return (
      <div className={`mt-3 p-5 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-150'} animate-fade-in`}>
        <h3 className="text-xs font-bold text-gray-550 flex items-center gap-1.5 mb-3">
          <HeartHandshake className="w-4 h-4 text-indigo-400" /> {question.label}
        </h3>
        <div className="flex flex-wrap gap-2">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                selected.includes(opt)
                  ? vc.tabActive
                  : `${vc.tabInactive} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all active:scale-95 shadow-sm"
          >
            Confirm <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT FALLBACK (Text / Textarea are typed directly in ConversationInput)
  return null;
}
