import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../providers/ThemeProvider';
import {
  ArrowRight, Github, Sun, Moon, Menu, X, HeartPulse,
  Flame, Sparkles, Check, ChevronDown, Smile, Play,
  ShieldCheck, Settings, LogOut, LayoutDashboard, LifeBuoy, Target, Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

const FEATURES = [
  { icon: Smile, title: 'Mood & Energy Tracking', desc: 'A quick daily rating for mood, energy, and sleep — the core habit that makes reflection possible.' },
  { icon: Sparkles, title: 'AI-Powered Reflections', desc: 'A warm, personalized reflection on your day — never diagnostic, always grounded in what you actually shared.' },
  { icon: HeartPulse, title: 'Coping Tools Tracker', desc: 'Log what helps you get through hard moments, and see what you lean on most over time.' },
  { icon: Flame, title: 'Streaks & Achievements', desc: 'A gentle nudge to keep showing up for yourself, computed entirely from your own check-in history.' },
  { icon: Users, title: 'Private Support Contacts', desc: 'Keep the people you can lean on close at hand — visible only to you, never shared.' },
  { icon: LifeBuoy, title: 'Crisis Resources, Always', desc: 'Real helplines are always one tap away — never gated behind the AI, never optional.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Log Your Check-in', desc: 'A short daily flow — mood, energy, sleep, and whatever else is on your mind.' },
  { step: '02', title: 'Get a Reflection', desc: 'AI turns your check-in into a short, supportive reflection grounded in your own words.' },
  { step: '03', title: 'Track Your Progress', desc: 'Watch your mood trend, streak, and achievements build up over time.' },
];

const FAQS = [
  {
    q: 'Is MindForge a replacement for therapy?',
    a: "No. MindForge is a journaling companion, not a clinical tool. It never diagnoses, never prescribes, and always closes its reflections with a reminder to seek professional care when it's needed.",
  },
  {
    q: 'Is my check-in data private?',
    a: 'Yes. Your check-ins, support contacts, and reflections are tied only to your account and are never shared or shown to anyone else.',
  },
  {
    q: 'How does the AI avoid giving medical advice?',
    a: "The system prompt behind every reflection has hard boundaries built in: no diagnosis, no medication guidance, no invented facts — only a gentle reflection on what you actually shared.",
  },
  {
    q: "What happens if I'm in crisis?",
    a: 'MindForge screens for crisis language and will always surface real crisis resources — never gated behind the AI, and shown even if the AI call fails.',
  },
];

export default function HomePortal() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Interactive mockup state machine
  const [mockupStep, setMockupStep] = useState(0);
  // Bumped on every "View Demo" click. setMockupStep(0) alone is a no-op
  // in React when mockupStep is already 0 (the common case, since the demo
  // auto-cycles 0→1→2→0 continuously on its own) — this key forces the
  // effect below to genuinely restart the sequence every time.
  const [demoReplayKey, setDemoReplayKey] = useState(0);

  useEffect(() => {
    let timer;
    if (mockupStep === 0) {
      timer = setTimeout(() => setMockupStep(1), 1800);
    } else if (mockupStep === 1) {
      timer = setTimeout(() => setMockupStep(2), 1800);
    } else if (mockupStep === 2) {
      timer = setTimeout(() => setMockupStep(3), 3200);
    } else if (mockupStep === 3) {
      timer = setTimeout(() => setMockupStep(0), 3600);
    }
    return () => clearTimeout(timer);
  }, [mockupStep, demoReplayKey]);

  const triggerMockupDemo = () => {
    setMockupStep(1); // jump straight to the animated step for instant feedback
    setDemoReplayKey((k) => k + 1);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#E2DFD2] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 transition-colors duration-300"
    >
      {/* Persistent Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/40 dark:border-gray-800/45 bg-white/40 dark:bg-gray-950/40 backdrop-blur-lg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/15 group-hover:scale-105 transition-all duration-300">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-gray-950 dark:from-white to-gray-500 dark:to-gray-400 gradient-text">
              Mind<span className="text-indigo-600 dark:text-indigo-400 ml-0.5">Forge</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-black dark:hover:text-white transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors duration-200">How it Works</a>
            <a href="#faq" className="hover:text-black dark:hover:text-white transition-colors duration-200">FAQ</a>
            <a
              href="https://github.com/Zephyrex21/mind-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center text-indigo-400 font-bold text-xs">
                    {(user.displayName || 'G')[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className={`absolute right-0 mt-2.5 w-52 rounded-2xl border p-2.5 shadow-xl z-20 space-y-1 ${
                      isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}>
                      <div className="px-2 py-1.5 border-b border-gray-200 dark:border-gray-800 mb-1.5 text-left">
                        <p className="text-xs font-bold truncate">{user.displayName}</p>
                        <p className="text-[9px] text-gray-500 truncate">{user.isGuest ? 'Guest account' : user.email}</p>
                      </div>
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold w-full text-left transition-colors ${
                          isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                      </button>
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold w-full text-left transition-colors ${
                          isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5" /> Settings
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-800 my-1 pt-1" />
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold w-full text-left text-red-500 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => openLoginModal(() => navigate('/dashboard'))}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all duration-200 ${
                    isDark
                      ? 'border-gray-800 bg-gray-900 hover:bg-gray-900 hover:text-white text-gray-300 shadow-md'
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-950 text-gray-600 shadow-sm'
                  }`}
                >
                  Sign In
                </button>
                <Link
                  to="/check-in"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-700 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Start Check-in
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            <button onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} className="p-2 text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 right-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-6 z-40 space-y-4 shadow-lg transition-colors duration-300"
          >
            <nav className="flex flex-col gap-4 text-base font-medium text-gray-700 dark:text-gray-400">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white">How it Works</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-black dark:hover:text-white">FAQ</a>
            </nav>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white dark:bg-indigo-500">
                    Dashboard
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="block text-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500">
                    Log Out
                  </button>
                </>
              ) : (
                <Link to="/check-in" onClick={() => setMobileMenuOpen(false)} className="block text-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-indigo-700 text-white dark:bg-indigo-600">
                  Start Check-in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-12 gap-12 items-center">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

        <div className="md:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[11px] font-bold uppercase tracking-wide">
            <Target className="w-3 h-3" /> Built for UN SDG 3 — Good Health & Wellbeing
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-gray-950 dark:text-white">
            A daily check-in <br />
            for your <span className="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 gradient-text">mental wellbeing</span>
          </h1>
          <p className="text-gray-700 dark:text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg">
            Log your mood, energy, and sleep in under a minute. Get a warm, AI-written reflection grounded in your own words — never diagnostic, always supportive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              to="/check-in"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              Start Check-in <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={triggerMockupDemo}
              className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" /> Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Right - Interactive Mockup */}
        <div className="md:col-span-6">
          <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800/80 bg-[#F6F8FA]/60 dark:bg-[#161B22]/60 backdrop-blur-md overflow-hidden shadow-2xl transition-colors duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-[#F6F8FA] dark:bg-[#161B22] transition-colors duration-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500/60" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 text-[11px] font-mono text-gray-600 dark:text-gray-400 w-64 md:w-80 transition-colors duration-300">
                <Smile className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                <span className="truncate">today's check-in</span>
              </div>
              <div className="w-12" />
            </div>

            <div className="p-6 min-h-[300px] flex flex-col font-mono text-xs select-none bg-white dark:bg-[#0D1117] transition-colors duration-300">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {mockupStep === 0 && (
                    <motion.div key="step-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-left">
                      <div className="text-gray-700 dark:text-gray-400 flex items-center gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400">$</span> mood: 3/5 &nbsp; energy: 2/5 &nbsp; sleep: 5.5h
                      </div>
                      <div className="text-gray-500 dark:text-gray-500">Ready to reflect. Click "Watch Demo" to replay.</div>
                    </motion.div>
                  )}

                  {mockupStep === 1 && (
                    <motion.div key="step-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 text-left">
                      <div className="text-gray-800 dark:text-gray-300 flex items-center gap-2 animate-pulse font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Reflecting on today's check-in...
                      </div>
                      <div className="space-y-1.5 pl-4 text-gray-600 dark:text-gray-500">
                        <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" /> Mood & energy noted</div>
                        <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" /> Coping tools reviewed</div>
                        <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" /> Safety screen passed</div>
                      </div>
                    </motion.div>
                  )}

                  {mockupStep === 2 && (
                    <motion.div key="step-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 text-left">
                      <div className="text-indigo-500 font-bold">## Today's Reflection</div>
                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        It sounds like today asked a lot of you on not much sleep. Noticing that and still showing up for your check-in is worth acknowledging...
                      </div>
                    </motion.div>
                  )}

                  {mockupStep === 3 && (
                    <motion.div key="step-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 text-left">
                      <div className="text-gray-800 dark:text-gray-300 flex items-center gap-2 font-bold">
                        <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Saved to your dashboard
                      </div>
                      <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-1.5 text-orange-500 font-bold">
                          <Flame className="w-4 h-4" /> 7-day streak
                        </div>
                        <div className="text-gray-500 dark:text-gray-500">·</div>
                        <div className="text-gray-600 dark:text-gray-400">avg mood 3.6/5</div>
                      </div>
                      <div className="flex items-end gap-1 h-10 pt-1">
                        {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                            className="w-3 rounded-full bg-gradient-to-t from-indigo-500 to-purple-400"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress dots — signals a guided sequence rather than a one-off animation */}
              <div className="flex items-center gap-1.5 pt-4 mt-auto">
                {[0, 1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      mockupStep === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">Everything a daily check-in needs</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">Built to be quick, honest, and genuinely supportive.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 text-left space-y-3 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300">
                <Icon className="w-5 h-5 text-indigo-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-sm text-gray-950 dark:text-white">{title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative max-w-5xl mx-auto px-6 py-20 border-t border-gray-200 dark:border-gray-800 text-center transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-16 space-y-4"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">How it works</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">Three steps, every day, in under two minutes.</p>
        </motion.div>
        <div className="relative grid sm:grid-cols-3 gap-10">
          {/* Connecting line behind the numbered circles, signaling a sequence */}
          <div className="hidden sm:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-500/30 to-transparent" />
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-500/30 text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center justify-center shadow-sm transition-colors duration-300">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-gray-950 dark:text-white pt-1">{item.title}</h3>
              <p className="text-gray-700 dark:text-gray-400 text-xs leading-relaxed max-w-[200px]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Preview Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">See your progress build</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">Mood trends, streaks, and achievements — all computed from your own check-ins.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/40 p-4 max-w-5xl mx-auto overflow-hidden shadow-xl transition-colors duration-300">
          <div className="flex items-center gap-1.5 pb-3 border-b border-gray-200 dark:border-gray-800 px-2">
            <span className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500/60" />
          </div>

          <div className="grid md:grid-cols-12 min-h-[380px] bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 space-y-6 text-left bg-white dark:bg-gray-950">
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Your Dashboard</div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Built entirely on your data</h4>
              </div>
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                  <div className="font-semibold text-gray-950 dark:text-white">Mood & Energy Trend</div>
                  <div className="text-gray-600 dark:text-gray-400">Computed from your own saved check-ins — no external APIs.</div>
                </div>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                  <div className="font-semibold text-gray-950 dark:text-white">Streaks & Achievements</div>
                  <div className="text-gray-600 dark:text-gray-400">A gentle nudge to keep showing up for yourself.</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 p-6 flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
              <div className="w-full max-w-md p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl space-y-4 font-sans text-left transition-colors duration-300">
                <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-800 pb-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Your progress</span>
                  <span className="text-[10px] text-orange-500 flex items-center gap-1"><Flame className="w-3 h-3" /> 7-day streak</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Avg mood (30d):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">3.6 / 5</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Avg sleep (30d):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">6.8h</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Total check-ins:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">42</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base">Everything you need to know about using MindForge.</p>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden text-left shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-gray-950 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-500 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-6 pb-6 text-xs sm:text-sm text-gray-700 dark:text-gray-400 leading-relaxed border-t border-gray-200 dark:border-gray-900 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-700 flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-gray-950 dark:text-white">
              Mind<span className="text-indigo-700 dark:text-indigo-400">Forge</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Not a substitute for professional mental health care
          </div>

          <div className="text-right text-[11px] text-gray-500 dark:text-gray-400">
            <div>© {new Date().getFullYear()} MindForge. Built for UN SDG 3.</div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
