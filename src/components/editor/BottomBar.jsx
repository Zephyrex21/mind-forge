import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useGenerator } from '../../hooks/useGenerator';

/**
 * Bottom navigation bar with back/next buttons and current step label.
 */
export default function BottomBar() {
  const { vc } = useTheme();
  const { currentStep, currentStepIndex, steps, canGoNext, validationMessage, goNext, goBack, stepLabel } = useGenerator();

  // Don't show on the generate step (it has its own navigation)
  if (currentStep === 'generate') return null;

  return (
    <div className={`sticky bottom-0 z-20 border-t ${vc.surface} backdrop-blur-md`}>
      {!canGoNext && validationMessage && (
        <p className="px-6 pt-2 text-xs font-medium text-amber-500 text-center sm:text-left">
          {validationMessage}
        </p>
      )}
      <div className="px-6 py-3 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
            currentStepIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
          } ${vc.btnSec}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <span className={`text-xs font-medium ${vc.textSec} hidden sm:block`}>
          {stepLabel}
        </span>

        <button
          onClick={goNext}
          disabled={!canGoNext}
          className={`flex items-center gap-1 px-5 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
            !canGoNext ? 'opacity-50 cursor-not-allowed' : ''
          } ${vc.btn}`}
        >
          {currentStepIndex === steps.length - 2 ? 'Review' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
