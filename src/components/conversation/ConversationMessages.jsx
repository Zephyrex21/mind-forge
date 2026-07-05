import React, { useRef, useEffect } from 'react';
import ConversationBubble from './ConversationBubble';
import QuestionRenderer from './QuestionRenderer';
import TypingIndicator from './TypingIndicator';
import SuggestionCards from './SuggestionCards';

export default function ConversationMessages({ 
  messages = [], 
  isTyping = false, 
  currentQuestion = null, 
  generator, 
  onSubmitAnswer,
  onStartProfileConversation 
}) {
  const bottomRef = useRef(null);

  // Auto scroll to bottom when messages or typing states change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 w-full">
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          const showInteractiveInput = isLastMessage && currentQuestion && currentQuestion.id === msg.questionId;
          const showSuggestions = msg.isGreeting && messages.length === 1;

          return (
            <ConversationBubble
              key={msg.id || index}
              message={msg}
            >
              {/* If suggestion cards are needed */}
              {showSuggestions && (
                <SuggestionCards onSelectAction={onStartProfileConversation} />
              )}

              {/* Renders custom inline widgets for active questions */}
              {showInteractiveInput && (
                <QuestionRenderer
                  question={currentQuestion}
                  generator={generator}
                  onSubmit={onSubmitAnswer}
                />
              )}
            </ConversationBubble>
          );
        })}

        {isTyping && (
          <div className="flex gap-4 items-start w-full">
            <div className="w-8 h-8 rounded-xl bg-indigo-700 flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <TypingIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
