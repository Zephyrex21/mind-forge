import React from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { useToast } from '../../providers/ToastProvider';
import TopBar from '../../../components/editor/TopBar';
import BottomBar from '../../../components/editor/BottomBar';
import SettingsDrawer from '../../../components/editor/SettingsDrawer';
import StepContainer from '../../../components/editor/StepContainer';
import { GeneratorContext, useGeneratorState } from '../../../hooks/useGenerator';
import { useGenerator } from '../../../hooks/useGenerator';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ConversationLayout from '../../../components/conversation/ConversationLayout';

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -12, scale: 0.99, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] } }
};

/**
 * Provider that creates the single generator state instance and shares
 * it with all child components via GeneratorContext.
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
 * Inner check-in content — consumes generator context.
 */
function CheckInBuilderContent() {
  const { vc, builderStyle } = useTheme();
  const { currentStep } = useGenerator();
  const location = useLocation();

  const isChatRoute = location.pathname.endsWith('/chat') || builderStyle === 'conversation';

  if (isChatRoute) {
    return <ConversationLayout />;
  }

  const isGenerateStep = currentStep === 'generate';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen flex flex-col transition-colors duration-300 ${vc.bg} ${vc.text}`}
    >
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
    </motion.div>
  );
}

/**
 * CheckInBuilder — wraps everything in GeneratorProvider.
 */
export default function CheckInBuilder() {
  return (
    <GeneratorProvider>
      <CheckInBuilderContent />
    </GeneratorProvider>
  );
}
