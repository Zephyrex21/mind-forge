import React, { useState } from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';
import {
  User, Smile, HeartHandshake, Target, Edit2,
  Check, Loader2, Copy, Download, Save,
} from 'lucide-react';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../app/providers/ToastProvider';
import { checkinsApi } from '../../services/checkinsApi';

export default function ReviewScreen({ generator, onJumpToQuestion }) {
  const { vc, isDark } = useTheme();
  const { executeWithAuth } = useAuth();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [checkinId, setCheckinId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  const {
    formData,
    generateReflection,
    isGenerating,
    generatedMarkdown,
    editMarkdown,
    setEditMarkdown,
    safetyFlagged,
    crisisResources,
    aiModel,
    hasGeneratedOnce,
  } = generator;

  const handleSave = () => {
    executeWithAuth(async () => {
      setIsSaving(true);
      try {
        const payload = { ...formData, aiReflection: editMarkdown || generatedMarkdown, flaggedForSafety: safetyFlagged, aiModel };
        if (checkinId) {
          await checkinsApi.update(checkinId, payload);
          showToast('Check-in updated!');
        } else {
          const saved = await checkinsApi.create(payload);
          setCheckinId(saved._id);
          showToast('Check-in saved!');
        }
      } catch (err) {
        showToast(err.message || 'Failed to save check-in');
      } finally {
        setIsSaving(false);
      }
    }, 'check-in save');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editMarkdown || generatedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editMarkdown || generatedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wellness-reflection.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6 mt-4 animate-fade-in text-left">
      {safetyFlagged && (
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
          <p className="text-sm font-bold text-rose-500 mb-2">Real support is available right now</p>
          {(crisisResources || []).map(r => (
            <p key={r.name} className="text-xs text-gray-600 dark:text-gray-300">{r.name} — {r.contact}</p>
          ))}
        </div>
      )}

      {hasGeneratedOnce ? (
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-md'} space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                {isGenerating ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Check className="w-5 h-5 text-emerald-500" />}
                {isGenerating ? 'Regenerating your reflection...' : 'Your Reflection is Ready'}
              </h3>
              <p className={`text-xs ${vc.textSec}`}>Review, copy, or save your reflection.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 p-0.5 bg-gray-50 dark:bg-gray-950">
                <button onClick={() => setActiveTab('preview')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'preview' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                  Preview
                </button>
                <button onClick={() => setActiveTab('raw')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'raw' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                  Raw
                </button>
              </div>
              <button onClick={handleCopy} disabled={isGenerating || !generatedMarkdown} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleSave} disabled={isSaving || isGenerating || !generatedMarkdown} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="w-3.5 h-3.5 text-indigo-500" /> {isSaving ? 'Saving...' : checkinId ? 'Updated' : 'Save'}
              </button>
              <button onClick={handleDownload} disabled={isGenerating || !generatedMarkdown} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4 max-h-[500px] overflow-y-auto">
            {isGenerating && !editMarkdown ? (
              <div className="space-y-3 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-3 rounded-full shimmer-bg" style={{ width: `${55 + Math.random() * 40}%` }} />
                ))}
              </div>
            ) : activeTab === 'preview' ? (
              <MarkdownRenderer content={editMarkdown} />
            ) : (
              <textarea
                value={editMarkdown}
                onChange={(e) => setEditMarkdown(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs leading-relaxed bg-transparent border-0 outline-none resize-none text-gray-800 dark:text-gray-200 focus:ring-0"
              />
            )}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} space-y-3 relative group`}>
          <button onClick={() => onJumpToQuestion('currentFocus')} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><User className="w-4 h-4 text-blue-500" /> About You</h4>
          <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
            <div><span className="text-gray-400">Focus:</span> {formData.currentFocus || 'Not provided'}</div>
            <div><span className="text-gray-400">Intention:</span> {formData.intention || 'Not provided'}</div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} space-y-3 relative group`}>
          <button onClick={() => onJumpToQuestion('mood')} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Smile className="w-4 h-4 text-emerald-500" /> Mood & Energy</h4>
          <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
            <div><span className="text-gray-400">Mood:</span> {formData.mood}/5</div>
            <div><span className="text-gray-400">Energy:</span> {formData.energy}/5</div>
            <div><span className="text-gray-400">Sleep:</span> {formData.sleepHours || '—'}h, quality {formData.sleepQuality}/5</div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} space-y-3 relative group`}>
          <button onClick={() => onJumpToQuestion('copingTools')} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><HeartHandshake className="w-4 h-4 text-purple-500" /> Coping Tools</h4>
          <div className="flex flex-wrap gap-1">
            {(formData.copingTools || []).length > 0 ? (
              formData.copingTools.map(t => (
                <span key={t} className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>{t}</span>
              ))
            ) : (
              <span className="text-xs text-gray-400">None selected</span>
            )}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} space-y-3 relative group`}>
          <button onClick={() => onJumpToQuestion('goals')} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Target className="w-4 h-4 text-amber-500" /> Goals & Gratitude</h4>
          <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <div className="truncate"><span className="text-gray-400">Goals:</span> {formData.goals || 'Not provided'}</div>
            <div className="truncate"><span className="text-gray-400">Gratitude:</span> {formData.gratitude || 'Not provided'}</div>
          </div>
        </div>
      </div>

      {!hasGeneratedOnce ? (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => executeWithAuth(generateReflection, 'reflection generation')}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all duration-150 active:scale-[0.98] shadow-lg shadow-indigo-500/15 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" /> Reflecting...</>) : (<><Check className="w-5 h-5" /> Generate Reflection</>)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
