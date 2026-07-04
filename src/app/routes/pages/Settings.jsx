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
  const { vc, isDark, theme, setTheme, builderStyle, setBuilderStyle } = useTheme();
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
      className="min-h-screen bg-[#0D1117] text-[#F3F4F6] flex flex-col"
    >
      {/* Sub Header */}
      <div className="border-b border-white/5 bg-[#161B22]/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-lg border border-white/5 bg-[#161B22] text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-left">
            <h1 className="text-base font-bold text-white">
              System Settings
            </h1>
            <p className="text-[10px] text-[#9CA3AF]">
              Configure system themes and view database profiles
            </p>
          </div>
        </div>
      </div>

      {/* Content centered layout */}
      <div className="flex-1 max-w-xl w-full mx-auto px-6 py-12 space-y-6">
        
        {/* Interface Options */}
        <div className="p-6 rounded-2xl border border-white/5 bg-[#161B22]/40 space-y-4 text-left">
          <h2 className="text-sm font-bold text-white">
            Interface Options
          </h2>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#9CA3AF]">Active Vibe / Design Theme</span>
              <div className="grid grid-cols-3 gap-2">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`py-2 text-[10px] uppercase font-bold rounded-lg border transition-all ${
                      theme === t 
                        ? 'bg-[#5B8CFF]/15 text-[#5B8CFF] border-[#5B8CFF]/25' 
                        : 'bg-[#161B22] border-white/5 text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-3 border-t border-white/5">
              <span className="text-xs font-semibold text-[#9CA3AF]">Builder Style</span>
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
                        ? 'bg-[#5B8CFF]/15 text-[#5B8CFF] border-[#5B8CFF]/25' 
                        : 'bg-[#161B22] border-white/5 text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Database Details */}
        <div className="p-6 rounded-2xl border border-white/5 bg-[#161B22]/40 space-y-3 text-xs text-[#9CA3AF] text-left">
          <h2 className="text-sm font-bold text-white">
            Database Details
          </h2>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span>Database:</span>
            <span className="text-white font-semibold font-mono">MongoDB</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span>Collections:</span>
            <span className="text-white font-semibold font-mono">users, checkins</span>
          </div>
          <p className="text-[10px] leading-relaxed pt-2">
            Your account, saved check-ins, and support contacts are stored in MongoDB, tied only to your account and never shared.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
