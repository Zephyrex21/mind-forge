import React from 'react';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { useConversationStore } from './conversationStore';
import ConversationHeader from './ConversationHeader';
import ConversationSidebar from './ConversationSidebar';
import ConversationMessages from './ConversationMessages';
import ConversationInput from './ConversationInput';
import ProgressBar from './ProgressBar';
import ResumeDialog from './ResumeDialog';
import ReviewScreen from './ReviewScreen';
import SettingsDrawer from '../editor/SettingsDrawer';
import { CHECKIN_QUESTIONS } from './questionRegistry';

/**
 * Conversational (chat-style) check-in flow — an alternative to the
 * step-by-step Classic Wizard, driven by the same CHECKIN_QUESTIONS list.
 */
export default function ConversationLayout() {
  const { vc, isDark } = useTheme();
  const { showToast } = useToast();

  const store = useConversationStore();
  const {
    messages,
    currentQuestionId,
    isTyping,
    showResumeDialog,
    restoreSession,
    discardSession,
    startConversation,
    submitAnswer,
    handleCommand,
    progress,
    formData,
    setSettingsOpen,
  } = store;

  const handleInputSubmit = (text) => {
    if (text.startsWith('/')) {
      const handled = handleCommand(text);
      if (!handled) showToast(`Unknown or invalid command: ${text}`);
      return;
    }
    submitAnswer(text);
  };

  const currentQuestion = currentQuestionId
    ? CHECKIN_QUESTIONS.find(q => q.id === currentQuestionId)
    : null;

  const currentSectionName = currentQuestion ? currentQuestion.section : 'Welcome';

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${vc.bg} ${vc.text} relative font-sans`}>
      {showResumeDialog && (
        <ResumeDialog onResume={restoreSession} onDiscard={discardSession} />
      )}

      <ConversationHeader
        title="MindForge Check-in"
        subTitle={currentSectionName}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <ProgressBar percentage={progress.percentage} />

      <div className="flex-1 flex overflow-hidden w-full relative">
        <ConversationSidebar progress={progress} currentSection={currentSectionName} />

        <main className="flex-1 flex flex-col min-w-0 h-full relative">
          <ConversationMessages
            messages={messages}
            isTyping={isTyping}
            currentQuestion={currentQuestion}
            generator={store}
            onSubmitAnswer={submitAnswer}
            onStartProfileConversation={startConversation}
          />

          {currentQuestionId === 'review' && (
            <div className="absolute inset-0 bg-white dark:bg-gray-950 overflow-y-auto px-6 py-6 z-10">
              <div className="max-w-3xl mx-auto">
                <ReviewScreen
                  generator={store}
                  onJumpToQuestion={(id) => {
                    submitAnswer(formData[id], `Jump to edit ${id}`);
                  }}
                />
              </div>
            </div>
          )}

          {currentQuestionId !== 'review' && (
            <div className={`p-4 border-t ${isDark ? 'border-gray-800 bg-gray-900/70' : 'border-gray-200 bg-white/70'} backdrop-blur-md sticky bottom-0 z-20`}>
              <div className="max-w-2xl mx-auto w-full">
                <ConversationInput
                  onSubmit={handleInputSubmit}
                  disabled={isTyping}
                  placeholder={currentQuestion ? `Type your answer for ${currentQuestion.label}...` : "Let's start today's check-in..."}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      <SettingsDrawer />
    </div>
  );
}
