import { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import { SECTION_DEFS } from '../constants/sections';
import { generateApi } from '../services/checkinsApi';

/**
 * Context for sharing generator state across the component tree.
 * Created by GeneratorProvider in CheckInBuilder, consumed by useGenerator().
 */
export const GeneratorContext = createContext(null);

/**
 * Hook to access generator state. Must be used inside GeneratorProvider.
 */
export function useGenerator() {
  const ctx = useContext(GeneratorContext);
  if (!ctx) throw new Error('useGenerator must be used within GeneratorProvider');
  return ctx;
}

// Fixed step order — a daily check-in is a short, consistent flow every
// time, so (unlike the old README wizard) there's no section-picker step.
const STEPS = [
  'about-you', 'mood-energy', 'coping-tools', 'goals', 'milestones',
  'gratitude', 'support-contacts', 'crisis-resources', 'custom', 'generate',
];

/**
 * The raw hook that creates generator state. Only called once in GeneratorProvider.
 * Manages: form data, step navigation, and AI reflection generation.
 *
 * Generation routes through the backend AI gateway (POST /api/generate).
 * No direct Gemini API calls — the API key lives only on the server.
 */
export function useGeneratorState(showToast) {
  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Wizard navigation
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Generation state
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [editMarkdown, setEditMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [safetyFlagged, setSafetyFlagged] = useState(false);
  const [crisisResources, setCrisisResources] = useState(null);

  // Preview state
  const [previewTab, setPreviewTab] = useState('preview');

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const steps = STEPS;

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(steps.length - 1);
    }
  }, [steps.length, currentStepIndex]);

  const currentStep = steps[currentStepIndex];

  // --- Form helpers ---

  const updateForm = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  // --- Navigation ---

  // A daily check-in should have minimal friction — mood/energy/sleep quality
  // always have a default value, so there's nothing to block on.
  const canGoNext = true;

  const goNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }
  }, [currentStepIndex, steps.length]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  }, [currentStepIndex]);

  // Step label for display
  const stepLabel = useMemo(() => {
    if (currentStep === 'generate') return 'Your Reflection';
    const def = SECTION_DEFS.find(d => d.key === currentStep);
    return def?.name || currentStep;
  }, [currentStep]);

  // --- Generation (via backend AI gateway) ---

  const generateReflection = useCallback(async () => {
    if (isGenerating) return; // Prevent double-clicks

    setIsGenerating(true);
    setSafetyFlagged(false);
    setCrisisResources(null);

    try {
      const data = await generateApi.generateReflection(formData);
      const text = data.markdown || '';

      setGeneratedMarkdown(text);
      setEditMarkdown(text);
      setSafetyFlagged(!!data.safetyFlagged);
      setCrisisResources(data.crisisResources || null);

      if (data.safetyFlagged) {
        showToast('We noticed some heavy language in your entry — resources are shown below.');
      } else if (data.cached) {
        showToast('Reflection loaded (instant!)');
      } else {
        showToast('Reflection generated.');
      }
    } catch (err) {
      if (err.status === 409) {
        showToast('A generation is already in progress. Please wait.');
      } else if (err.status === 429) {
        showToast('AI is busy. Please wait a moment and try again.');
      } else if (err.status === 400) {
        showToast(err.message);
      } else {
        showToast(err.message || 'Cannot reach server. Is the backend running?');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, formData, showToast]);

  // --- Reset ---

  const resetAll = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStepIndex(0);
    setGeneratedMarkdown('');
    setEditMarkdown('');
    setSafetyFlagged(false);
    setCrisisResources(null);
    setConfirmReset(false);
    showToast('Check-in reset');
  }, [showToast]);

  return {
    // Form
    formData,
    updateForm,

    // Navigation
    steps,
    currentStepIndex,
    currentStep,
    canGoNext,
    goNext,
    goBack,
    stepLabel,

    // Generation
    generatedMarkdown,
    setGeneratedMarkdown,
    editMarkdown,
    setEditMarkdown,
    isGenerating,
    generateReflection,
    safetyFlagged,
    crisisResources,

    // Preview
    previewTab,
    setPreviewTab,

    // Settings
    settingsOpen,
    setSettingsOpen,
    confirmReset,
    setConfirmReset,
    resetAll,
  };
}

export default useGenerator;
