import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col justify-center items-center gap-4 font-sans select-none">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#5B8CFF] rounded-full animate-spin" />
        </div>
        <div className="text-xs font-semibold text-[#9CA3AF] tracking-wide animate-pulse">
          Verifying secure session credentials...
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated user to home page, saving redirect path in state
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
