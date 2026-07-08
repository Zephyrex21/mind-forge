import React from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../providers/ToastProvider';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Page transitions definition
const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, scale: 0.99, transition: { duration: 0.18, ease: 'easeIn' } }
};

export default function Settings() {
  const { isDark, theme, setTheme, builderStyle, setBuilderStyle } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showToast(`Theme changed to ${newTheme}`);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Sub Header */}
      <div className={`border-b px-6 py-4 flex items-center justify-between ${
        isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/70'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            aria-label="Back to home"
            className={`p-2 rounded-lg border transition-colors ${
              isDark ? 'border-gray-800 bg-gray-900 text-gray-400 hover:text-white' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-left">
            <h1 className="text-base font-bold">Settings</h1>
            <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Appearance and account details
            </p>
          </div>
        </div>
      </div>

      {/* Content centered layout */}
      <div className="flex-1 max-w-xl w-full mx-auto px-6 py-12 space-y-6">

        {/* Interface Options */}
        <div className={`p-6 rounded-2xl border space-y-4 text-left ${
          isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-200 bg-white shadow-sm'
        }`}>
          <h2 className="text-sm font-bold">Interface Options</h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Theme</span>
              <div className="grid grid-cols-3 gap-2">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`py-2 text-[10px] uppercase font-bold rounded-lg border transition-all ${
                      theme === t
                        ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/25'
                        : isDark ? 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white' : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={`space-y-1 pt-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Check-in Builder Style</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'classic', label: 'Classic Wizard' },
                  { id: 'conversation', label: 'Conversation' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setBuilderStyle(style.id);
                      showToast(`Builder style set to ${style.label}`);
                    }}
                    className={`py-2 text-[10px] uppercase font-bold rounded-lg border transition-all ${
                      builderStyle === style.id
                        ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/25'
                        : isDark ? 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white' : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy / Data Details */}
        <div className={`p-6 rounded-2xl border space-y-3 text-xs text-left ${
          isDark ? 'border-gray-800 bg-gray-900/40 text-gray-400' : 'border-gray-200 bg-white shadow-sm text-gray-500'
        }`}>
          <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Data</h2>
          <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <span>Database:</span>
            <span className={`font-semibold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>MongoDB</span>
          </div>
          <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <span>Stored:</span>
            <span className={`font-semibold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>account, check-ins</span>
          </div>
          <p className="text-[10px] leading-relaxed pt-2">
            Your account, saved check-ins, and support contacts are stored in MongoDB, tied only to your account and never shared.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
