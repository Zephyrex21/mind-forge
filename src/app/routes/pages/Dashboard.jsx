import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../providers/ToastProvider';
import { checkinsApi } from '../../../services/checkinsApi';
import {
  Flame, BookOpen, Moon, Smile, Zap, BedDouble, ChevronRight,
  Plus, ExternalLink, Settings, LayoutDashboard,
  RefreshCw, NotebookPen, Menu, X, LogOut, Mail, CalendarDays,
  HeartHandshake, Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MoodTrendChart from '../../../components/wellness/MoodTrendChart';
import CheckinStreakRing from '../../../components/wellness/CheckinStreakRing';
import AchievementBadges from '../../../components/wellness/AchievementBadges';
import GuestUpgradeCard from '../../../components/wellness/GuestUpgradeCard';
import MarkdownRenderer from '../../../components/common/MarkdownRenderer';

function StatCard({ icon: Icon, label, value, suffix = '', isDark }) {
  return (
    <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="text-2xl font-black font-mono">{value ?? '—'}{value != null ? suffix : ''}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { vc, isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, checkinsData] = await Promise.all([
          checkinsApi.stats().catch(() => null),
          checkinsApi.list().catch(() => []),
        ]);
        setStats(statsData);
        setRecentCheckins(checkinsData.slice(0, 3));
      } catch (err) {
        showToast('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user) loadDashboardData();
  }, [user, showToast]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this check-in?')) return;
    try {
      await checkinsApi.remove(id);
      showToast('Check-in deleted');
      const data = await checkinsApi.list();
      setRecentCheckins(data.slice(0, 3));
    } catch (err) {
      showToast('Failed to delete check-in');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col justify-center items-center gap-4 font-sans select-none">
        <RefreshCw className="w-8 h-8 text-[#5B8CFF] animate-spin" />
        <span className="text-xs text-[#9CA3AF]">Loading your dashboard...</span>
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className={`min-h-screen flex ${vc.bg} ${vc.text} transition-colors duration-300 font-sans text-left`}>

      {/* SIDEBAR */}
      <aside className={`w-64 border-r shrink-0 hidden md:flex flex-col h-screen ${
        isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50/50'
      }`}>
        <div className="p-6 flex items-center gap-2.5 border-b border-gray-300 dark:border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold select-none">M</div>
          <span className="font-bold text-sm">MindForge</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/10 border border-indigo-500/10 text-indigo-500"
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => navigate('/my-checkins')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <NotebookPen className="w-4 h-4" /> My Check-ins
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </nav>

        {/* Account info */}
        <div className="p-4 border-t border-gray-300 dark:border-gray-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shadow-sm">
              {(user.displayName || 'G')[0].toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold truncate">{user.displayName}</div>
              <div className="text-[10px] text-gray-500 truncate">{user.isGuest ? 'Guest account' : user.email}</div>
            </div>
          </div>
          <div className="space-y-1 text-[10px] text-gray-500">
            {!user.isGuest && user.email && (
              <div className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 flex-shrink-0" /> {user.email}</div>
            )}
            {memberSince && (
              <div className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3 flex-shrink-0" /> Member since {memberSince}</div>
            )}
            <div className="flex items-center gap-1.5 capitalize">
              <Sparkles className="w-3 h-3 flex-shrink-0" /> {user.plan} plan
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-center py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-semibold rounded-xl transition-all"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className={`border-b shrink-0 px-6 py-4 flex items-center justify-between sticky top-0 z-35 ${
          isDark ? 'border-gray-800 bg-gray-950/80' : 'border-gray-200 bg-white/80'
        } backdrop-blur-md`}>
          <div className="text-left flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              className={`md:hidden p-1.5 rounded-lg border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div>
              <h1 className="text-base font-bold">Your Wellness Dashboard</h1>
              <p className="text-[10px] text-gray-500">Everything about your check-ins, mood, and progress in one place</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isDark ? 'border-gray-800 bg-gray-900 hover:text-white text-gray-400' : 'border-gray-200 bg-white hover:text-gray-950 text-gray-500 shadow-sm'
            }`}
          >
            Back to Home
          </button>
        </header>

        {mobileNavOpen && (
          <div className={`md:hidden border-b px-4 py-3 space-y-1 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
            <button onClick={() => { setMobileNavOpen(false); navigate('/my-checkins'); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
              <NotebookPen className="w-4 h-4" /> My Check-ins
            </button>
            <button onClick={() => { setMobileNavOpen(false); navigate('/settings'); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/5">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        )}

        <div className="max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
          {/* Guest upgrade prompt */}
          {user.isGuest && <GuestUpgradeCard />}

          {/* Welcome Banner */}
          <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 justify-between ${
            isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                {(user.displayName || 'G')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Welcome back, {user.displayName}!</h2>
                <p className={`text-xs ${vc.textSec}`}>How are you doing today?</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/check-in')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Check-in
            </button>
          </div>

          {/* Streak ring + stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border flex flex-col items-center justify-center ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CheckinStreakRing streak={stats?.currentStreak || 0} size={90} />
            </div>
            <StatCard icon={BookOpen} label="Total Check-ins" value={stats?.totalCheckins || 0} isDark={isDark} />
            <StatCard icon={Smile} label="Avg Mood (30d)" value={stats?.avgMood} suffix=" / 5" isDark={isDark} />
            <StatCard icon={Zap} label="Avg Energy (30d)" value={stats?.avgEnergy} suffix=" / 5" isDark={isDark} />
            <StatCard icon={Moon} label="Avg Sleep (30d)" value={stats?.avgSleepHours} suffix="h" isDark={isDark} />
            <StatCard icon={BedDouble} label="Sleep Quality (30d)" value={stats?.avgSleepQuality} suffix=" / 5" isDark={isDark} />
          </div>

          {/* Mood trend chart */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-4">Mood & Energy Trend</h3>
            <MoodTrendChart trend={stats?.trend || []} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most-used coping tools */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-purple-500" /> What Helps You Most
              </h3>
              {stats?.topCopingTools?.length ? (
                <div className="flex flex-wrap gap-2">
                  {stats.topCopingTools.map(({ tool, count }) => (
                    <span
                      key={tool}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                        isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tool}
                      <span className={`px-1.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>{count}×</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`text-xs ${vc.textSec}`}>Log a few check-ins with coping tools to see your patterns here.</p>
              )}
            </div>

            {/* Latest reflection preview */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Latest Reflection
              </h3>
              {stats?.latestReflection ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500">
                    {new Date(stats.latestReflection.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="text-xs leading-relaxed line-clamp-5 github-markdown-body">
                    <MarkdownRenderer content={stats.latestReflection.aiReflection} />
                  </div>
                  <button
                    onClick={() => navigate('/my-checkins')}
                    className="text-xs font-semibold text-indigo-500 hover:opacity-80 transition-opacity flex items-center gap-1 pt-1"
                  >
                    Read full reflection <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className={`text-xs ${vc.textSec}`}>Generate your first reflection to see it here.</p>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" /> Achievements
            </h3>
            <AchievementBadges stats={stats} />
          </div>

          {/* Recent check-ins */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500">Recent Check-ins</h3>
              <button
                onClick={() => navigate('/my-checkins')}
                className="text-xs font-semibold text-indigo-500 flex items-center gap-0.5 hover:opacity-80 transition-opacity"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentCheckins.map(c => (
                <div
                  key={c._id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between h-[150px] hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-200 ${
                    isDark ? 'bg-gray-900/40 border-gray-800 hover:bg-gray-900 hover:border-gray-700' : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm truncate pr-4">{new Date(c.createdAt).toLocaleDateString()}</h4>
                    <p className={`text-xs mt-1 ${vc.textSec}`}>Mood {c.mood ?? '—'}/5 · Energy {c.energy ?? '—'}/5</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-3">
                    <button
                      onClick={() => navigate('/my-checkins')}
                      className="text-xs font-semibold text-indigo-500 hover:opacity-80 transition-opacity flex items-center gap-1"
                    >
                      Open <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500"
                      title="Delete"
                      aria-label="Delete check-in"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {recentCheckins.length === 0 && (
                <div className={`col-span-full py-12 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 text-center text-xs ${vc.textSec}`}>
                  No check-ins yet. Start your first one above!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
