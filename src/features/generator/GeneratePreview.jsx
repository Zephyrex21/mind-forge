import React, { useState } from 'react';
import {
  Sparkles, Loader2, RefreshCw, Copy, ArrowLeft,
  Save, LifeBuoy, Phone, LayoutDashboard, Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useGenerator } from '../../hooks/useGenerator';
import { useToast } from '../../app/providers/ToastProvider';
import { useAuth } from '../../hooks/useAuth';
import { checkinsApi } from '../../services/checkinsApi';
import { copyToClipboard, downloadFile } from '../../utils/clipboard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';

/**
 * Final step: Generate & Preview — split-screen layout.
 * Left panel: generate button, quick editor, save/download.
 * Right panel: raw markdown / rendered preview tabs.
 */
export default function GeneratePreview() {
  const { vc, isDark } = useTheme();
  const { showToast } = useToast();
  const { executeWithAuth } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [checkinId, setCheckinId] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  const {
    formData,
    generatedMarkdown,
    editMarkdown,
    setEditMarkdown,
    isGenerating,
    generateReflection,
    safetyFlagged,
    crisisResources,
    aiModel,
    previewTab,
    setPreviewTab,
    goBack,
    hasGeneratedOnce,
  } = useGenerator();

  // Note: regeneration is triggered explicitly via the button below, not
  // automatically — see handleSave/generateReflection.

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
        setJustSaved(true);
      } catch (err) {
        showToast(err.message || 'Failed to save check-in');
      } finally {
        setIsSaving(false);
      }
    }, 'saving your check-in');
  };

  const mdToRender = editMarkdown || generatedMarkdown;

  const copyMarkdown = async () => {
    const success = await copyToClipboard(mdToRender);
    showToast(success ? 'Copied to clipboard!' : 'Failed to copy.');
  };

  const handleDownload = () => {
    downloadFile(mdToRender, 'wellness-reflection.md');
    showToast('Reflection downloaded!');
  };

  const renderRawMarkdown = () => {
    const lines = mdToRender ? mdToRender.split('\n') : [];
    return (
      <div className="relative rounded-xl overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-xs text-gray-400">markdown</span>
          <button onClick={copyMarkdown} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>
        <div className="overflow-auto max-h-[70vh] bg-[#1e1e2e] p-0">
          <table className="w-full text-sm font-mono">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="text-right pr-4 pl-4 py-0.5 text-gray-500 select-none w-12 border-r border-gray-700/50">{i + 1}</td>
                  <td className="pl-4 pr-4 py-0.5 text-gray-200 whitespace-pre-wrap break-all">{line || ' '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCleanPreview = () => (
    <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-auto max-h-[70vh]`}>
      <div className="github-markdown-body">
        <MarkdownRenderer content={mdToRender} />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in flex flex-col lg:flex-row h-[calc(100vh-60px)] overflow-hidden">
      {/* LEFT PANEL — Generate controls + editor */}
      <div className={`w-full lg:w-[40%] p-6 overflow-y-auto border-r ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className={`text-2xl font-bold mb-1 ${vc.text}`}>Your Reflection</h2>
        <p className={`mb-6 ${vc.textSec}`}>A short, supportive reflection based on today's check-in</p>

        {safetyFlagged && (
          <div className={`mb-4 p-4 rounded-xl border ${isDark ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <LifeBuoy className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-bold text-rose-500">Real support is available right now</span>
            </div>
            <div className="space-y-1.5">
              {(crisisResources || []).map((r) => (
                <div key={r.name} className="flex items-center gap-2 text-xs">
                  <Phone className="w-3 h-3 text-rose-500 flex-shrink-0" />
                  <span className={vc.text}>{r.name} — {r.contact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {!hasGeneratedOnce ? (
            <button
              onClick={() => executeWithAuth(generateReflection, 'generating your reflection')}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold transition-all active:scale-95 ${vc.btn} ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGenerating ? 'Reflecting on your check-in...' : 'Generate Reflection'}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => { setJustSaved(false); executeWithAuth(generateReflection, 'generating your reflection'); }}
                  disabled={isGenerating}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${vc.btnSec} ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isGenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
                <button
                  onClick={copyMarkdown}
                  disabled={isGenerating || !generatedMarkdown}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${vc.btn} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || isGenerating || !generatedMarkdown}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 border disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark ? 'border-gray-800 bg-gray-900 text-gray-300' : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <Save className="w-4 h-4 text-indigo-500" />
                  {isSaving ? 'Saving...' : checkinId ? 'Update Check-in' : 'Save Check-in'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isGenerating || !generatedMarkdown}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${vc.btnSec} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Download .md
                </button>
              </div>

              {justSaved && checkinId && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border ${
                    isDark ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  }`}
                >
                  <Check className="w-4 h-4" /> Saved! <LayoutDashboard className="w-4 h-4 ml-1" /> View Dashboard
                </button>
              )}
            </div>
          )}
        </div>

        {hasGeneratedOnce && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${vc.text}`}>Quick Edit</label>
            <textarea
              value={editMarkdown}
              onChange={e => { setEditMarkdown(e.target.value); setJustSaved(false); }}
              rows={16}
              placeholder={isGenerating ? 'Regenerating...' : ''}
              className={`w-full px-4 py-3 rounded-xl font-mono text-xs transition-all outline-none resize-none ${vc.input}`}
            />
          </div>
        )}

        <button
          onClick={goBack}
          className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${vc.btnSec}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Editing
        </button>
      </div>

      {/* RIGHT PANEL — Preview */}
      <div className={`w-full lg:w-[60%] flex flex-col overflow-hidden ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className={`flex items-center gap-1 p-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <button
              onClick={() => setPreviewTab('raw')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${previewTab === 'raw' ? vc.tabActive : vc.tabInactive}`}
            >
              Raw Markdown
            </button>
            <button
              onClick={() => setPreviewTab('preview')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${previewTab === 'preview' ? vc.tabActive : vc.tabInactive}`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {!mdToRender ? (
            isGenerating ? (
              <div className="space-y-4 p-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 rounded-full shimmer-bg" style={{ width: `${60 + Math.random() * 40}%` }} />
                ))}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center h-full border-2 border-dashed rounded-2xl p-12 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <Sparkles className={`w-12 h-12 mb-4 ${vc.textSec}`} />
                <p className={`text-lg font-medium ${vc.textSec}`}>Your reflection will appear here</p>
                <p className={`text-sm mt-1 ${vc.textSec}`}>Click "Generate Reflection" to get started</p>
              </div>
            )
          ) : (
            previewTab === 'raw' ? renderRawMarkdown() : renderCleanPreview()
          )}
        </div>
      </div>
    </div>
  );
}
