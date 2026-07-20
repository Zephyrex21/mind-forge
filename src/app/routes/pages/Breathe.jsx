import React from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BreathingExercise from '../../../components/wellness/BreathingExercise';

export default function Breathe() {
  const { vc, isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col ${vc.bg} ${vc.text} transition-colors duration-300 font-sans`}>
      <header className={`border-b shrink-0 px-6 py-4 flex items-center gap-3 ${
        isDark ? 'border-gray-800 bg-gray-950/85' : 'border-gray-200 bg-white/85'
      } backdrop-blur-md`}>
        <button
          onClick={() => navigate('/dashboard')}
          className={`p-2 rounded-lg border transition-colors ${
            isDark ? 'border-gray-800 bg-gray-900 hover:text-white text-gray-400' : 'border-gray-200 bg-white hover:text-gray-950 text-gray-500 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-left">
          <h1 className="text-sm font-bold flex items-center gap-2">
            <Wind className="w-5 h-5 text-indigo-500" /> Guided Breathing
          </h1>
          <p className="text-[10px] text-gray-500">A minute to slow down and reset</p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <BreathingExercise />
      </div>
    </div>
  );
}
