import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from './providers/ToastProvider';
import { AuthProvider } from '../features/auth/AuthProvider';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy loading pages for code splitting & performance optimization
const HomePortal = lazy(() => import('./routes/pages/HomePortal'));
const CheckInBuilder = lazy(() => import('./routes/pages/CheckInBuilder'));
const Settings = lazy(() => import('./routes/pages/Settings'));
const Dashboard = lazy(() => import('./routes/pages/Dashboard'));
const CheckIns = lazy(() => import('./routes/pages/CheckIns'));
const NotFound = lazy(() => import('./routes/pages/NotFound'));

/**
 * Skeleton loader placeholder used during async page splits
 */
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col justify-center items-center gap-4 font-sans select-none">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-[#5B8CFF] rounded-full animate-spin" />
      </div>
      <div className="text-xs font-semibold text-[#9CA3AF] tracking-wide animate-pulse">
        Loading MindForge...
      </div>
    </div>
  );
}

/**
 * Root App component — handles providers, layout wrappers, and lazy routes.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePortal />} />
                  <Route path="/check-in" element={<CheckInBuilder />} />
                  <Route path="/check-in/chat" element={<CheckInBuilder />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/my-checkins" element={<ProtectedRoute><CheckIns /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/not-found" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/not-found" replace />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
