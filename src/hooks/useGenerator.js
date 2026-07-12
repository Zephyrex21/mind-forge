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
  const [aiModel, setAiModel] = useState('');
  // Tracks whether at least one reflection has been generated this session,
  // independent of what's currently in generatedMarkdown (which gets
  // cleared at the start of each regenerate) — keeps the Regenerate/Copy/
  // Save button row from flickering back to the first-time "Generate"
  // button while a regeneration is in flight.
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

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

  // Per-step validation. Most steps are intentionally optional (a daily
  // check-in should stay low-friction), but a couple of fields are the
  // actual substance of the entry and shouldn't be skippable outright.
  const STEP_VALIDATORS = useMemo(() => ({
    'about-you': (data) => Boolean(data.currentFocus && data.currentFocus.trim().length > 0),
    'mood-energy': () => true, // mood/energy/sleep quality always have a default value
    'coping-tools': () => true,
    goals: () => true,
    milestones: () => true,
    gratitude: () => true,
    'support-contacts': () => true,
    'crisis-resources': () => true, // informational only, nothing to fill in
    custom: () => true,
  }), []);

  const STEP_VALIDATION_MESSAGES = useMemo(() => ({
    'about-you': "Add a quick note on your current focus to continue.",
  }), []);

  const canGoNext = useMemo(() => {
    const validator = STEP_VALIDATORS[currentStep];
    return validator ? validator(formData) : true;
  }, [currentStep, formData, STEP_VALIDATORS]);

  const validationMessage = useMemo(() => {
    return canGoNext ? '' : (STEP_VALIDATION_MESSAGES[currentStep] || 'Please complete this section to continue.');
  }, [canGoNext, currentStep, STEP_VALIDATION_MESSAGES]);

  const goNext = useCallback(() => {
    if (!canGoNext) {
      showToast(validationMessage);
      return;
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }
  }, [currentStepIndex, steps.length, canGoNext, validationMessage, showToast]);

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

    // Regenerating means the user wants a fresh take — never silently reuse
    // a cached response just because the inputs happen to match.
    const isRegenerate = Boolean(generatedMarkdown) || hasGeneratedOnce;
    const previousMarkdown = generatedMarkdown;

    setIsGenerating(true);
    setSafetyFlagged(false);
    setCrisisResources(null);
    // Clear the old result up front so it's unambiguous a new generation is
    // running — leaving stale content on screen during/after a failed
    // regeneration is exactly what made past failures look like "nothing
    // changed no matter what I typed."
    setGeneratedMarkdown('');
    setEditMarkdown('');

    try {
      const data = await generateApi.generateReflection(formData, { forceRefresh: isRegenerate });
      const text = data.markdown || '';

      setGeneratedMarkdown(text);
      setEditMarkdown(text);
      setSafetyFlagged(!!data.safetyFlagged);
      setCrisisResources(data.crisisResources || null);
      setAiModel(data.model || '');
      setHasGeneratedOnce(true);

      if (data.safetyFlagged) {
        showToast('We noticed some heavy language in your entry — resources are shown below.');
      } else if (data.cached) {
        showToast('Reflection loaded (instant!)');
      } else {
        showToast('Reflection generated.');
      }
    } catch (err) {
      // Restore whatever was there before rather than leaving the pane
      // empty — a failed regenerate shouldn't cost the user their last
      // successful reflection.
      if (previousMarkdown) {
        setGeneratedMarkdown(previousMarkdown);
        setEditMarkdown(previousMarkdown);
      }

      if (err.status === 409) {
        showToast('A generation is already in progress. Please wait.');
      } else if (err.status === 429 || err.status === 400) {
        // Show the server's actual message — it already distinguishes "you're
        // sending requests too fast" from "Gemini itself is busy," which a
        // generic message would otherwise hide.
        showToast(err.message || 'Please wait a moment and try again.');
      } else {
        showToast(err.message || 'Cannot reach server. Is the backend running?');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, generatedMarkdown, hasGeneratedOnce, formData, showToast]);

  // --- Reset ---

  const resetAll = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStepIndex(0);
    setGeneratedMarkdown('');
    setEditMarkdown('');
    setSafetyFlagged(false);
    setCrisisResources(null);
    setHasGeneratedOnce(false);
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
    validationMessage,
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
    hasGeneratedOnce,
    aiModel,

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
