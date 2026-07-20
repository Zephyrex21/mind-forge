import React, { useEffect, useState } from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../providers/ToastProvider';
import { checkinsApi } from '../../../services/checkinsApi';
import {
  ArrowLeft, RefreshCw, Moon, CalendarDays, HeartHandshake, Activity, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InsightBarChart from '../../../components/wellness/InsightBarChart';
import {
  MIN_CHECKINS_FOR_INSIGHTS,
  getSleepMoodBuckets,
  getDayOfWeekPattern,
  getCopingToolEffectiveness,
  getMoodEnergyCorrelation,
} from '../../../utils/emotionAnalytics';

export default function EmotionInsights() {
  const { vc, isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await checkinsApi.list();
        setCheckins(data);
      } catch (err) {
        showToast(err.message || 'Failed to load check-ins');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col justify-center items-center gap-4 font-sans select-none">
        <RefreshCw className="w-8 h-8 text-[#5B8CFF] animate-spin" />
        <span className="text-xs text-[#9CA3AF]">Crunching your check-ins...</span>
      </div>
    );
  }

  const cardClass = `p-5 rounded-2xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`;

  if (checkins.length < MIN_CHECKINS_FOR_INSIGHTS) {
    const remaining = MIN_CHECKINS_FOR_INSIGHTS - checkins.length;
    return (
      <div className={`min-h-screen flex flex-col ${vc.bg} ${vc.text} transition-colors duration-300 font-sans`}>
        <InsightsHeader isDark={isDark} navigate={navigate} />
        <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-16 text-center">
          <Activity className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Not quite enough data yet</h2>
          <p className={`text-sm ${vc.textSec}`}>
            Log {remaining} more check-in{remaining === 1 ? '' : 's'} ({checkins.length}/{MIN_CHECKINS_FOR_INSIGHTS}) and patterns in your mood, sleep, and coping tools will show up here.
          </p>
        </div>
      </div>
    );
  }

  const sleepBuckets = getSleepMoodBuckets(checkins);
  const dayPattern = getDayOfWeekPattern(checkins);
  const toolEffectiveness = getCopingToolEffectiveness(checkins);
  const correlation = getMoodEnergyCorrelation(checkins);

  const bestSleepBucket = sleepBuckets.reduce((best, b) => (!best || (b.avgMood ?? -1) > best.avgMood ? b : best), null);
  const daysWithData = dayPattern.filter((d) => d.count > 0);
  const bestDay = daysWithData.reduce((best, d) => (!best || d.avgMood > best.avgMood ? d : best), null);
  const toughestDay = daysWithData.reduce((worst, d) => (!worst || d.avgMood < worst.avgMood ? d : worst), null);

  return (
    <div className={`min-h-screen flex flex-col ${vc.bg} ${vc.text} transition-colors duration-300 font-sans text-left`}>
      <InsightsHeader isDark={isDark} navigate={navigate} />

      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-6">
        <p className={`text-xs ${vc.textSec}`}>
          Based on {checkins.length} check-in{checkins.length === 1 ? '' : 's'}. These are simple patterns in your own data — not a diagnosis, just a mirror.
        </p>

        {/* Sleep vs Mood */}
        <div className={cardClass}>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-500" /> Sleep & Mood
          </h3>
          {bestSleepBucket && (
            <p className={`text-xs mb-4 ${vc.textSec}`}>
              Your mood tends to be highest after <span className="font-semibold text-gray-700 dark:text-gray-300">{bestSleepBucket.label}</span> of sleep (avg {bestSleepBucket.avgMood}/5).
            </p>
          )}
          <InsightBarChart data={sleepBuckets.map((b) => ({ label: b.label, value: b.avgMood }))} color="#6366f1" />
        </div>

        {/* Day of week pattern */}
        <div className={cardClass}>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-purple-500" /> Day-of-Week Pattern
          </h3>
          {bestDay && toughestDay && bestDay.label !== toughestDay.label && (
            <p className={`text-xs mb-4 ${vc.textSec}`}>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{bestDay.label}s</span> tend to be your best days (avg {bestDay.avgMood}/5), and <span className="font-semibold text-gray-700 dark:text-gray-300">{toughestDay.label}s</span> your toughest (avg {toughestDay.avgMood}/5).
            </p>
          )}
          <InsightBarChart data={dayPattern.map((d) => ({ label: d.label, value: d.avgMood }))} color="#a855f7" />
        </div>

        {/* Coping tool effectiveness */}
        <div className={cardClass}>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-500" /> What Helps Most
          </h3>
          {toolEffectiveness.length === 0 ? (
            <p className={`text-xs ${vc.textSec}`}>Log a coping tool on a few check-ins to see which ones correlate with a better mood.</p>
          ) : (
            <div className="space-y-2">
              {toolEffectiveness.map((t) => (
                <div key={t.tool} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-200 bg-gray-50'}`}>
                  <span className="text-sm font-medium">{t.tool}</span>
                  {t.hasEnoughData ? (
                    <span className={`flex items-center gap-1 text-xs font-bold ${t.delta > 0 ? 'text-green-500' : t.delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {t.delta > 0 && <TrendingUp className="w-3.5 h-3.5" />}
                      {t.delta < 0 && <TrendingDown className="w-3.5 h-3.5" />}
                      {t.delta === 0 && <Minus className="w-3.5 h-3.5" />}
                      {t.delta > 0 ? '+' : ''}{t.delta} mood on days used
                    </span>
                  ) : (
                    <span className={`text-xs ${vc.textSec}`}>Used {t.count}× — need more data</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mood/Energy correlation */}
        <div className={cardClass}>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-orange-500" /> Mood & Energy
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-black font-mono">{correlation.r != null ? correlation.r : '—'}</div>
            <p className={`text-xs ${vc.textSec}`}>
              {correlation.label} between your logged mood and energy across {correlation.count} check-ins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsHeader({ isDark, navigate }) {
  return (
    <header className={`border-b shrink-0 px-6 py-4 flex items-center gap-3 sticky top-0 z-30 ${
      isDark ? 'border-gray-800 bg-gray-950/85' : 'border-gray-200 bg-white/85'
    } backdrop-blur-md`}>
      <button
        onClick={() => navigate('/dashboard')}
        className={`p-2 rounded-lg border transition-colors ${
          isDark ? 'border-gray-800 bg-gray-900 hover:text-white text-gray-400' : 'border-gray-200 bg-white hover:text-gray-950 text-gray-500 shadow-sm'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div>
        <h1 className="text-sm font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" /> Emotion Insights
        </h1>
        <p className="text-[10px] text-gray-500">Patterns in your own mood, sleep & coping data</p>
      </div>
    </header>
  );
}
