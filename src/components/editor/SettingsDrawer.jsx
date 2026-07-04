import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useGenerator } from '../../hooks/useGenerator';

/**
 * Settings drawer — slides in from the right.
 * Controls: vibe style, font size, API key change, data reset.
 */
export default function SettingsDrawer() {
  const { vc, vibe, setVibe, isDark, fontSize, setFontSize } = useTheme();
  const { logout } = useAuth();
  const { settingsOpen, setSettingsOpen, confirmReset, setConfirmReset, resetAll } = useGenerator();

  return (
    <>
      {/* Backdrop */}
      {settingsOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => { setSettingsOpen(false); setConfirmReset(false); }}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-50 shadow-2xl transition-transform duration-300 ${
          settingsOpen ? 'translate-x-0' : 'translate-x-full'
        } ${vc.surface} ${vc.bg}`}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-bold ${vc.text}`}>Settings</h2>
            <button
              onClick={() => { setSettingsOpen(false); setConfirmReset(false); }}
              className={`p-1 rounded-lg hover:opacity-70 ${vc.text}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vibe selector */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${vc.text}`}>
              Builder Style Vibe
            </label>
            <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
              {[
                { v: 'minimal', l: 'Minimal' },
                { v: 'bold', l: 'Bold Dev' },
                { v: 'github', l: 'GitHub' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setVibe(v)}
                  className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                    vibe === v ? vc.tabActive : vc.tabInactive
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${vc.text}`}>
              Font Size
            </label>
            <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
              {[
                { v: 'sm', l: 'Small' },
                { v: 'md', l: 'Medium' },
                { v: 'lg', l: 'Large' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setFontSize(v)}
                  className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                    fontSize === v ? vc.tabActive : vc.tabInactive
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Change API Key */}
          <div className="mb-6">
            <button
              onClick={() => { logout(); setSettingsOpen(false); }}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${vc.btnSec}`}
            >
              Change API Key
            </button>
          </div>

          {/* Reset all data */}
          <div className="mb-6">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
              >
                Reset All Data
              </button>
            ) : (
              <div className="p-3 rounded-lg border border-red-300 bg-red-50">
                <p className="text-sm text-red-700 mb-3">
                  Are you sure? This will clear all form data.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={resetAll}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${vc.textSec}`}>Built with Gemini AI + React</p>
            <p className={`text-xs mt-1 ${vc.textSec}`}>MindForge v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
