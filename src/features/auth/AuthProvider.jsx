import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../../services/authApi';
import { useToast } from '../../app/providers/ToastProvider';
import LoginModal from './LoginModal';

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
      return data.user;
    } catch (_) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const runPendingAction = useCallback(() => {
    setIsLoginModalOpen(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      action();
    }
  }, [pendingAction]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    showToast(`Welcome back, ${data.user.displayName}!`);
    runPendingAction();
  }, [showToast, runPendingAction]);

  const register = useCallback(async (email, password, displayName) => {
    const data = await authApi.register(email, password, displayName);
    setUser(data.user);
    showToast(`Welcome, ${data.user.displayName}!`);
    runPendingAction();
  }, [showToast, runPendingAction]);

  const continueAsGuest = useCallback(async () => {
    const data = await authApi.continueAsGuest();
    setUser(data.user);
    showToast('Continuing as guest — your check-ins are saved, but sign up anytime to keep access to them long-term.');
    runPendingAction();
  }, [showToast, runPendingAction]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setUser(null);
      showToast('Logged out');
      window.location.href = '/';
    } catch (err) {
      showToast('Logout failed');
    }
  }, [showToast]);

  const isAuthenticated = useCallback(() => user !== null, [user]);

  // Trigger actions (like generation) that require being signed in — opens
  // the login modal if needed, and resumes the action right after.
  const executeWithAuth = useCallback((actionFn, description = 'perform this action') => {
    if (user) {
      actionFn();
      return;
    }
    setPendingAction(() => actionFn);
    setIsLoginModalOpen(true);
  }, [user]);

  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    login,
    register,
    continueAsGuest,
    logout,
    isAuthenticated,
    refreshUser,
    executeWithAuth,
    openLoginModal: (callback) => {
      setPendingAction(() => callback);
      setIsLoginModalOpen(true);
    },
    closeLoginModal: () => setIsLoginModalOpen(false),
  }), [user, loading, login, register, continueAsGuest, logout, isAuthenticated, refreshUser, executeWithAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => { setIsLoginModalOpen(false); setPendingAction(null); }}
          onLogin={login}
          onRegister={register}
          onGuest={continueAsGuest}
        />
      )}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
