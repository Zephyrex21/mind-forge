import React, { useEffect, useState } from 'react';
import { Target, Plus, Flame, Check, X, Archive } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { goalsApi } from '../../services/goalsApi';
import { computeGoalStreak, toLocalDateKey } from '../../utils/goalStreak';

const MAX_GOALS_HINT = 12;

/**
 * A lightweight daily habit tracker: a handful of recurring goals the user
 * defines themselves (e.g. "Meditate 10 minutes"), each with a simple
 * done/not-done toggle for today and its own streak. Self-contained —
 * loads and mutates its own data, same pattern as AchievementBadges.
 */
export default function HabitTracker() {
  const { vc, isDark } = useTheme();
  const { showToast } = useToast();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const todayKey = toLocalDateKey();

  const load = async () => {
    try {
      const data = await goalsApi.list();
      setGoals(data);
    } catch (err) {
      showToast(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    try {
      const goal = await goalsApi.create(title);
      setGoals((prev) => [...prev, goal]);
      setNewTitle('');
      setAdding(false);
    } catch (err) {
      showToast(err.message || 'Failed to create goal');
    }
  };

  const handleToggleToday = async (goal) => {
    // Optimistic update so the checkbox feels instant; reconciled with the
    // server's response right after (and rolled back if it fails).
    const wasDone = goal.completions.includes(todayKey);
    const optimisticCompletions = wasDone
      ? goal.completions.filter((d) => d !== todayKey)
      : [...goal.completions, todayKey];
    setGoals((prev) => prev.map((g) => (g._id === goal._id ? { ...g, completions: optimisticCompletions } : g)));

    try {
      const updated = await goalsApi.toggle(goal._id, todayKey);
      setGoals((prev) => prev.map((g) => (g._id === goal._id ? updated : g)));
    } catch (err) {
      setGoals((prev) => prev.map((g) => (g._id === goal._id ? goal : g))); // roll back
      showToast(err.message || 'Failed to update goal');
    }
  };

  const handleArchive = async (goal) => {
    if (!window.confirm(`Archive "${goal.title}"? It'll be removed from this list and its streak will stop counting.`)) return;
    try {
      await goalsApi.archive(goal._id);
      setGoals((prev) => prev.filter((g) => g._id !== goal._id));
    } catch (err) {
      showToast(err.message || 'Failed to archive goal');
    }
  };

  if (loading) return null;

  return (
    <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-emerald-500" /> Habit Tracker
        </h3>
        {goals.length < MAX_GOALS_HINT ? (
          <button
            onClick={() => setAdding((p) => !p)}
            className="text-xs font-semibold text-indigo-500 flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Add Goal
          </button>
        ) : (
          <span className={`text-xs ${vc.textSec}`}>Limit reached ({MAX_GOALS_HINT})</span>
        )}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 mb-4">
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Meditate 10 minutes"
            maxLength={80}
            className={`flex-1 px-3 py-2 rounded-lg text-xs outline-none transition-all ${vc.input}`}
          />
          <button type="submit" className="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
            Save
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewTitle(''); }}
            className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {goals.length === 0 && !adding ? (
        <p className={`text-xs ${vc.textSec}`}>
          Track small daily habits alongside your check-ins — add your first goal above.
        </p>
      ) : (
        <div className="space-y-1">
          {goals.map((goal) => {
            const doneToday = goal.completions.includes(todayKey);
            const streak = computeGoalStreak(goal.completions, todayKey);
            return (
              <div
                key={goal._id}
                className={`flex items-center gap-3 py-2.5 px-1 border-b last:border-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}
              >
                <button
                  onClick={() => handleToggleToday(goal)}
                  aria-label={doneToday ? `Mark ${goal.title} as not done today` : `Mark ${goal.title} as done today`}
                  className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    doneToday
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isDark ? 'border-gray-700 hover:border-emerald-500' : 'border-gray-300 hover:border-emerald-500'
                  }`}
                >
                  {doneToday && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </button>

                <span className={`flex-1 text-sm ${doneToday ? `line-through ${vc.textSec}` : vc.text}`}>{goal.title}</span>

                {streak > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-orange-500 flex-shrink-0">
                    <Flame className="w-3.5 h-3.5" /> {streak}
                  </span>
                )}

                <button
                  onClick={() => handleArchive(goal)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                  title="Archive goal"
                  aria-label={`Archive ${goal.title}`}
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
