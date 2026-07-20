import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../providers/ToastProvider';
import { checkinsApi } from '../../../services/checkinsApi';
import {
  NotebookPen, Search, ArrowLeft, Star, Grid, List,
  Trash2, Plus, RefreshCw, ChevronDown, ChevronUp, Download, Printer,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../../../components/common/MarkdownRenderer';
import { exportCheckinsToCsv } from '../../../utils/exportCheckins';

const MOOD_FILTERS = [
  { value: 'all', label: 'Any Mood' },
  { value: 'great', label: 'Great (4-5)' },
  { value: 'okay', label: 'Okay (3)' },
  { value: 'tough', label: 'Tough (1-2)' },
];

const TIME_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
];

function matchesMoodFilter(mood, filter) {
  if (filter === 'all') return true;
  if (typeof mood !== 'number') return false;
  if (filter === 'great') return mood >= 4;
  if (filter === 'okay') return mood === 3;
  if (filter === 'tough') return mood <= 2;
  return true;
}

// A wide, case-insensitive search across everything a person is likely to
// remember about a past entry — not just the date, so "walking" or
// "grateful" actually finds the check-in it was written in.
function buildSearchHaystack(c) {
  return [
    c.title,
    new Date(c.createdAt).toLocaleDateString(),
    c.currentFocus,
    c.intention,
    c.copingNotes,
    c.goals,
    c.milestones,
    c.gratitude,
    c.customNotes,
    c.aiReflection,
    ...(c.copingTools || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function CheckIns() {
  const { user } = useAuth();
  const { vc, isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]);
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [moodFilter, setMoodFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [expanded, setExpanded] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  const loadCheckins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await checkinsApi.list();
      setCheckins(data);
    } catch (err) {
      showToast(err.message || 'Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) loadCheckins();
  }, [user, loadCheckins]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    const now = Date.now();
    const timeWindowMs = timeFilter === 'all' ? null : Number(timeFilter) * 24 * 60 * 60 * 1000;

    return checkins.filter(c => {
      const matchSearch = !searchLower || buildSearchHaystack(c).includes(searchLower);
      const matchFav = !onlyFavorites || c.isFavorite;
      const matchMood = matchesMoodFilter(c.mood, moodFilter);
      const matchTime = !timeWindowMs || now - new Date(c.createdAt).getTime() <= timeWindowMs;
      return matchSearch && matchFav && matchMood && matchTime;
    });
  }, [checkins, search, onlyFavorites, moodFilter, timeFilter]);

  const handleFavorite = async (id) => {
    try {
      await checkinsApi.toggleFavorite(id);
      loadCheckins();
    } catch (err) {
      showToast(err.message || 'Failed to update favorite status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this check-in? This action is permanent.')) return;
    try {
      await checkinsApi.remove(id);
      loadCheckins();
      showToast('Check-in deleted');
    } catch (err) {
      showToast(err.message || 'Failed to delete check-in');
    }
  };

  const handleExportCsv = () => {
    if (!filtered.length) {
      showToast('No check-ins to export with the current filters.');
      return;
    }
    exportCheckinsToCsv(filtered);
    setExportOpen(false);
  };

  const handlePrint = () => {
    setExportOpen(false);
    // Give the dropdown a tick to close before the print dialog captures
    // the page — otherwise it can appear mid-transition in the printout.
    setTimeout(() => window.print(), 50);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col justify-center items-center gap-4 font-sans select-none">
        <RefreshCw className="w-8 h-8 text-[#5B8CFF] animate-spin" />
        <span className="text-xs text-[#9CA3AF]">Loading your check-ins...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${vc.bg} ${vc.text} transition-colors duration-300 font-sans text-left`}>

      <header className={`print:hidden border-b shrink-0 px-6 py-4 flex items-center justify-between sticky top-0 z-35 ${
        isDark ? 'border-gray-800 bg-gray-950/85' : 'border-gray-200 bg-white/85'
      } backdrop-blur-md`}>
        <div className="flex items-center gap-3">
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
              <NotebookPen className="w-5 h-5 text-indigo-500" /> My Check-ins
            </h1>
            <p className="text-[10px] text-gray-500">Every saved wellness reflection, in one place</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setExportOpen(p => !p)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isDark ? 'border-gray-800 bg-gray-900 hover:text-white text-gray-400' : 'border-gray-200 bg-white hover:text-gray-950 text-gray-600 shadow-sm'
              }`}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            {exportOpen && (
              <>
                {/* Click-outside catcher */}
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-lg z-20 overflow-hidden ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={handleExportCsv}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-left hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors ${vc.text}`}
                  >
                    <Download className="w-3.5 h-3.5" /> Export as CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-left hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors border-t ${
                      isDark ? 'border-gray-800' : 'border-gray-100'
                    } ${vc.text}`}
                  >
                    <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/check-in')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Check-in
          </button>
        </div>
      </header>

      <div className="print:hidden flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-6">

        <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row gap-4 items-center justify-between ${
          isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries, gratitude, goals..."
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs transition-all outline-none ${vc.input}`}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto justify-end">
            <select
              value={moodFilter}
              onChange={e => setMoodFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border outline-none transition-colors ${
                isDark ? 'border-gray-800 bg-gray-900 text-gray-300' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {MOOD_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>

            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border outline-none transition-colors ${
                isDark ? 'border-gray-800 bg-gray-900 text-gray-300' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {TIME_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>

            <button
              onClick={() => setOnlyFavorites(p => !p)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                onlyFavorites
                  ? 'bg-amber-500/15 border-amber-500/35 text-amber-500'
                  : isDark ? 'border-gray-800 bg-gray-900 text-gray-400' : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500' : ''}`} /> Favorites Only
            </button>

            <div className="flex rounded-lg border border-gray-300 dark:border-gray-800 p-0.5 bg-gray-50 dark:bg-gray-950">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-500'}`}>
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-500'}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <p className={`text-[11px] ${vc.textSec}`}>
          Showing {filtered.length} of {checkins.length} check-in{checkins.length === 1 ? '' : 's'}
        </p>

        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}`}>
          {filtered.map(c => (
            <div
              key={c._id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDark ? 'bg-gray-900/40 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start gap-2.5 mb-2.5">
                  <div>
                    <h4 className="font-bold text-sm">{new Date(c.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
                    <p className={`text-xs mt-0.5 ${vc.textSec}`}>Mood {c.mood ?? '—'}/5 · Energy {c.energy ?? '—'}/5 · Sleep {c.sleepHours ?? '—'}h</p>
                  </div>
                  <button onClick={() => handleFavorite(c._id)} className="p-0.5 hover:scale-110 transition-transform">
                    <Star className={`w-4 h-4 ${c.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-3">
                  <button
                    onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                    className="text-xs font-semibold text-indigo-500 flex items-center gap-1 hover:opacity-85"
                  >
                    {expanded === c._id ? 'Hide Reflection' : 'View Reflection'}
                    {expanded === c._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500" title="Delete" aria-label="Delete check-in">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {expanded === c._id && (
                <div className={`px-5 pb-5 border-t animate-fade-in ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <div className="pt-4 text-sm github-markdown-body">
                    {c.aiReflection ? (
                      <MarkdownRenderer content={c.aiReflection} />
                    ) : (
                      <p className={vc.textSec}>No reflection was generated for this check-in.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={`col-span-full py-16 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 text-center text-xs ${vc.textSec}`}>
              No matching check-ins found.
            </div>
          )}
        </div>
      </div>

      {/* Print-only view — hidden on screen, shown only in the print/PDF
          output. Lists every filtered entry in full (regardless of which
          card was expanded on screen) in a clean, ink-friendly layout. */}
      <div className="hidden print:block px-8 py-6 text-black">
        <h1 className="text-xl font-bold mb-1">MindForge — My Check-ins</h1>
        <p className="text-xs text-gray-600 mb-6">
          Exported {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}
        </p>
        {filtered.map(c => (
          <div key={c._id} className="mb-6 break-inside-avoid">
            <h2 className="text-sm font-bold border-b border-gray-300 pb-1 mb-1.5">
              {new Date(c.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {c.isFavorite ? ' ★' : ''}
            </h2>
            <p className="text-xs text-gray-700 mb-1.5">
              Mood {c.mood ?? '—'}/5 · Energy {c.energy ?? '—'}/5 · Sleep {c.sleepHours ?? '—'}h
              {c.sleepQuality != null ? ` (quality ${c.sleepQuality}/5)` : ''}
            </p>
            {c.gratitude && <p className="text-xs mb-1"><strong>Gratitude:</strong> {c.gratitude}</p>}
            {c.goals && <p className="text-xs mb-1"><strong>Goals:</strong> {c.goals}</p>}
            {c.copingTools?.length > 0 && <p className="text-xs mb-1"><strong>Coping tools:</strong> {c.copingTools.join(', ')}</p>}
            {c.aiReflection && (
              <div className="text-xs mt-1.5 github-markdown-body">
                <strong>Reflection:</strong>
                <div className="mt-0.5"><MarkdownRenderer content={c.aiReflection} /></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
