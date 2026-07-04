import React, { lazy, Suspense } from 'react';
import { useGenerator } from '../../hooks/useGenerator';

// Lazy-load all step components for code splitting
const AboutYouStep = lazy(() => import('../../features/generator/steps/AboutYouStep'));
const MoodEnergyStep = lazy(() => import('../../features/generator/steps/MoodEnergyStep'));
const CopingToolsStep = lazy(() => import('../../features/generator/steps/CopingToolsStep'));
const GoalsStep = lazy(() => import('../../features/generator/steps/GoalsStep'));
const MilestonesStep = lazy(() => import('../../features/generator/steps/MilestonesStep'));
const GratitudeStep = lazy(() => import('../../features/generator/steps/GratitudeStep'));
const SupportContactsStep = lazy(() => import('../../features/generator/steps/SupportContactsStep'));
const CrisisResourcesStep = lazy(() => import('../../features/generator/steps/CrisisResourcesStep'));
const CustomStep = lazy(() => import('../../features/generator/steps/CustomStep'));
const GeneratePreview = lazy(() => import('../../features/generator/GeneratePreview'));

const STEP_MAP = {
  'about-you': AboutYouStep,
  'mood-energy': MoodEnergyStep,
  'coping-tools': CopingToolsStep,
  goals: GoalsStep,
  milestones: MilestonesStep,
  gratitude: GratitudeStep,
  'support-contacts': SupportContactsStep,
  'crisis-resources': CrisisResourcesStep,
  custom: CustomStep,
  generate: GeneratePreview,
};

/**
 * Routes the current wizard step to the correct component.
 * All step components are lazy-loaded for code splitting.
 */
export default function StepContainer() {
  const { currentStep } = useGenerator();
  const StepComponent = STEP_MAP[currentStep];

  if (!StepComponent) {
    return <p>Unknown step: {currentStep}</p>;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StepComponent />
    </Suspense>
  );
}
