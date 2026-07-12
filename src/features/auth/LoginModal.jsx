import React, { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import EmailAuthForm from './EmailAuthForm';
import GuestButton from './GuestButton';

export default function LoginModal({ onClose, onLogin, onRegister, onGuest, description }) {
  const { vc, isDark } = useTheme();
  const modalRef = useRef(null);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleEmailSubmit = async ({ email, password, displayName }) => {
    if (mode === 'signup') {
      await onRegister(email, password, displayName);
    } else {
      await onLogin(email, password);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    try {
      await onGuest();
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl animate-fade-in relative flex flex-col items-center text-center ${
          isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-md select-none">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-3.582-8-8 0-3.5 2.5-6 5-8.5.5 1.5 1 2.5 2 3.5 1-2 1-4 1-4s4 2.5 4 7c0 1-.5 2-1 2.5 1.5-.5 2.5-1.5 3-3 1 1.5 2 3.5 2 5.5 0 4.418-3.582 8-8 8z" />
          </svg>
        </div>

        <h3 id="modal-title" className="text-lg font-bold mb-1.5">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h3>
        <p className={`text-xs leading-relaxed max-w-sm mb-6 ${vc.textSec}`}>
          {description
            ? `Sign in to finish ${description} — your check-ins are saved and your streak is tracked from here on, or continue as a guest with zero setup.`
            : 'Sign in to save your check-ins and track your streak over time — or continue as a guest with zero setup.'}
        </p>

        <EmailAuthForm mode={mode} onSubmit={handleEmailSubmit} disabled={guestLoading} />

        <button
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
          className="text-xs font-medium text-indigo-500 hover:opacity-80 transition-opacity mt-3"
        >
          {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>

        <div className={`flex items-center gap-3 w-full my-4 ${vc.textSec}`}>
          <div className={`flex-1 h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
          <span className="text-[10px] uppercase tracking-wide">or</span>
          <div className={`flex-1 h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
        </div>

        <div className="w-full space-y-3">
          <GuestButton onClick={handleGuest} disabled={guestLoading} />
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDark ? 'border-gray-900 hover:bg-gray-800 text-gray-300' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
            }`}
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-5 text-[10px] text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Your check-ins are private and never shared.</span>
        </div>
      </div>
    </div>
  );
}
