import React from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { useToast } from '../providers/ToastProvider';
import TopBar from '../../components/editor/TopBar';
import BottomBar from '../../components/editor/BottomBar';
import SettingsDrawer from '../../components/editor/SettingsDrawer';
import StepContainer from '../../components/editor/StepContainer';
import { GeneratorContext, useGeneratorState } from '../../hooks/useGenerator';
import { useGenerator } from '../../hooks/useGenerator';

/**
 * Provider that creates the single generator state instance and shares
 * it with all child components via GeneratorContext.
 *
 * No longer requires apiKey — the API key lives on the server.
 */
function GeneratorProvider({ children }) {
  const { showToast } = useToast();
  const generator = useGeneratorState(showToast);

  return (
    <GeneratorContext.Provider value={generator}>
      {children}
    </GeneratorContext.Provider>
  );
}

/**
 * Inner editor content — consumes generator context.
 * Always renders the editor directly (no splash screen needed since
 * the API key is configured on the server).
 */
function EditorPageContent() {
  const { vc } = useTheme();
  const { currentStep } = useGenerator();

  const isGenerateStep = currentStep === 'generate';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${vc.bg} ${vc.text}`}>
      <TopBar />

      {isGenerateStep ? (
        <main className="flex-1 overflow-hidden">
          <StepContainer />
        </main>
      ) : (
        <>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-8">
              <div className={`p-6 sm:p-8 rounded-2xl ${vc.surface}`}>
                <StepContainer />
              </div>
            </div>
          </main>
          <BottomBar />
        </>
      )}

      <SettingsDrawer />
    </div>
  );
}

/**
 * EditorPage — wraps everything in GeneratorProvider.
 */
export default function EditorPage() {
  return (
    <GeneratorProvider>
      <EditorPageContent />
    </GeneratorProvider>
  );
}
