import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../providers/ToastProvider';
import { checkinsApi } from '../../../services/checkinsApi';
import {
  NotebookPen, Search, ArrowLeft, Star, Grid, List,
  Trash2, Plus, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../../../components/common/MarkdownRenderer';

export default function CheckIns() {
  const { user } = useAuth();
  const { vc, isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]);
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [expanded, setExpanded] = useState(null);

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
    return checkins.filter(c => {
      const matchSearch = (c.title || '').toLowerCase().includes(search.toLowerCase())
        || new Date(c.createdAt).toLocaleDateString().includes(search);
      const matchFav = !onlyFavorites || c.isFavorite;
      return matchSearch && matchFav;
    });
  }, [checkins, search, onlyFavorites]);

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

      <header className={`border-b shrink-0 px-6 py-4 flex items-center justify-between sticky top-0 z-35 ${
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

        <button
          onClick={() => navigate('/check-in')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Check-in
        </button>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-6">

        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-4 items-center justify-between ${
          isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by date..."
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs transition-all outline-none ${vc.input}`}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto justify-end">
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
    </div>
  );
}
