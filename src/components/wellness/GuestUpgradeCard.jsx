import React, { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../app/providers/ToastProvider';
import { authApi } from '../../services/authApi';

/**
 * Shown on the dashboard for guest accounts — guest data is real and saved,
 * but tied to a browser session rather than a real login. This lets them
 * convert to a full account (same user ID, so nothing is lost) without
 * losing their check-in history.
 */
export default function GuestUpgradeCard() {
  const { isDark, vc } = useTheme();
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await authApi.upgradeGuest(email.trim(), password, displayName.trim());
      setUser(data.user);
      showToast('Account created — your check-ins are safe and now permanently linked to your login.');
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`p-5 rounded-2xl border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-amber-500/15' : 'bg-amber-100'}`}>
          <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${vc.text}`}>You're using a guest account</p>
          <p className={`text-xs mt-0.5 ${vc.textSec}`}>
            Your check-ins are saved, but only tied to this browser. Add an email and password to keep permanent access — nothing you've logged will be lost.
          </p>

          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors active:scale-95"
            >
              Create a permanent account
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5 max-w-sm">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name (optional)"
                className={`w-full px-3 py-2 rounded-lg text-xs outline-none ${vc.input}`}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full px-3 py-2 rounded-lg text-xs outline-none ${vc.input}`}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 8 characters)"
                autoComplete="new-password"
                className={`w-full px-3 py-2 rounded-lg text-xs outline-none ${vc.input}`}
              />
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all active:scale-95 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
