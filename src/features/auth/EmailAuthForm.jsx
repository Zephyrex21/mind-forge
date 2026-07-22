import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Shared email/password form for both sign-in and sign-up.
 */
export default function EmailAuthForm({ mode, onSubmit, disabled }) {
  const { vc, fontClass } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (isSignup && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), password, displayName: displayName.trim() });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || disabled;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3 text-left">
      {isSignup && (
        <input
          type="text"
          id="auth-display-name"
          name="displayName"
          aria-label="Display name (optional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name (optional)"
          className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${fontClass} ${vc.input}`}
        />
      )}
      <input
        type="email"
        id="auth-email"
        name="email"
        aria-label="Email address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${fontClass} ${vc.input}`}
      />
      <input
        type="password"
        id="auth-password"
        name="password"
        aria-label={isSignup ? 'Password, minimum 8 characters' : 'Password'}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={isSignup ? 'Password (min. 8 characters)' : 'Password'}
        autoComplete={isSignup ? 'new-password' : 'current-password'}
        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${fontClass} ${vc.input}`}
      />

      {error && <p role="alert" className="text-xs text-rose-500">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.99] ${vc.btn} disabled:opacity-60`}
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSignup ? 'Create account' : 'Sign in'}
      </button>
    </form>
  );
}
