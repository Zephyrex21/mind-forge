import { useState, useEffect, useCallback, useRef } from 'react';
import { useGenerator } from '../../hooks/useGenerator';
import { conversationCache } from './conversationCache';
import { ConversationEngine } from './conversationEngine';
import { CHECKIN_QUESTIONS } from './questionRegistry';
import { INITIAL_FORM_DATA } from '../../constants/formDefaults';

const SESSION_KEY = 'checkin';

/**
 * Hook to manage conversation state, messages, caching, and navigation
 * command actions. Integrates directly with the parent useGenerator form
 * state (from GeneratorProvider in CheckInBuilder).
 */
export function useConversationStore() {
  let generatorContext = null;
  try {
    generatorContext = useGenerator();
  } catch (e) {
    // Context not available — fall back to standalone local state below.
  }

  const [localFormData, setLocalFormData] = useState(INITIAL_FORM_DATA);

  const generator = generatorContext || {
    formData: localFormData,
    updateForm: (key, val) => setLocalFormData(prev => ({ ...prev, [key]: val })),
    generateReflection: async () => {},
  };

  const { formData, updateForm } = generator;

  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [historyPath, setHistoryPath] = useState([]);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  const engineRef = useRef(new ConversationEngine(CHECKIN_QUESTIONS));
  const engine = engineRef.current;

  const getGreeting = useCallback(() => {
    const hours = new Date().getHours();
    let timeGreeting = 'Good evening';
    if (hours < 12) timeGreeting = 'Good morning';
    else if (hours < 18) timeGreeting = 'Good afternoon';
    return `${timeGreeting}. Let's do today's check-in together.`;
  }, []);

  const saveToCache = useCallback((updatedMessages, updatedQuestionId, updatedPath) => {
    conversationCache.saveSession(SESSION_KEY, {
      messages: updatedMessages,
      currentQuestionId: updatedQuestionId,
      historyPath: updatedPath,
      formData: generator.formData,
    });
  }, [generator.formData]);

  const restoreSession = useCallback(() => {
    const cached = conversationCache.loadSession(SESSION_KEY);
    if (cached) {
      setCurrentQuestionId(cached.currentQuestionId);
      setMessages(cached.messages);
      setHistoryPath(cached.historyPath || []);

      if (cached.formData) {
        Object.entries(cached.formData).forEach(([key, val]) => updateForm(key, val));
      }
      setShowResumeDialog(false);
    }
  }, [updateForm]);

  const discardSession = useCallback(() => {
    conversationCache.clearSession(SESSION_KEY);
    setShowResumeDialog(false);
    startFreshConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (conversationCache.hasSession(SESSION_KEY)) {
      setShowResumeDialog(true);
    } else {
      startFreshConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startFreshConversation = () => {
    const greetingText = getGreeting();
    setMessages([{
      id: 'greeting',
      sender: 'assistant',
      text: greetingText,
      timestamp: Date.now(),
      isGreeting: true,
    }]);
    setCurrentQuestionId(null);
    setHistoryPath([]);
  };

  const appendMessage = useCallback((msg, nextQId = currentQuestionId, path = historyPath) => {
    setMessages(prev => {
      const nextMsgs = [...prev, msg];
      saveToCache(nextMsgs, nextQId, path);
      return nextMsgs;
    });
  }, [currentQuestionId, historyPath, saveToCache]);

  const askQuestion = useCallback((questionId, prefilledUserMsg = null) => {
    setIsTyping(true);
    const question = engine.getQuestion(questionId);
    const delay = 300 + Math.random() * 400;

    setTimeout(() => {
      setIsTyping(false);

      const newMessages = [];
      if (prefilledUserMsg) newMessages.push(prefilledUserMsg);

      newMessages.push({
        id: `assistant_${questionId}_${Date.now()}`,
        sender: 'assistant',
        text: question.description || question.label,
        questionId,
        timestamp: Date.now(),
      });

      setMessages(prev => {
        const nextMsgs = [...prev, ...newMessages];
        saveToCache(nextMsgs, questionId, [...historyPath, questionId]);
        return nextMsgs;
      });

      setCurrentQuestionId(questionId);
      setHistoryPath(prev => [...prev, questionId]);
    }, delay);
  }, [engine, historyPath, saveToCache]);

  const handleCommand = useCallback((commandText) => {
    const cmd = commandText.trim().toLowerCase();

    if (cmd === '/back') {
      if (historyPath.length <= 1) {
        startFreshConversation();
        return true;
      }
      const prevPath = [...historyPath];
      prevPath.pop();
      const prevId = prevPath[prevPath.length - 1];

      setHistoryPath(prevPath);
      setCurrentQuestionId(prevId);
      appendMessage({ id: `cmd_back_${Date.now()}`, sender: 'user', text: 'Going back...', isCommand: true }, prevId, prevPath);
      return true;
    }

    if (cmd === '/skip') {
      const currentQ = engine.getQuestion(currentQuestionId);
      if (currentQ && !currentQ.required) {
        const nextQId = engine.getNextQuestionId(currentQuestionId, generator.formData);
        appendMessage({ id: `cmd_skip_${Date.now()}`, sender: 'user', text: 'Skipping...', isCommand: true });
        askQuestion(nextQId && nextQId !== 'done' ? nextQId : 'review');
        return true;
      }
      return false;
    }

    if (cmd === '/restart') {
      appendMessage({ id: `cmd_restart_${Date.now()}`, sender: 'user', text: 'Restarting conversation...', isCommand: true });
      discardSession();
      return true;
    }

    return false;
  }, [historyPath, currentQuestionId, engine, generator.formData, askQuestion, appendMessage, discardSession]);

  const submitAnswer = useCallback((value, formattedLabel = null) => {
    if (!currentQuestionId) return;

    const question = engine.getQuestion(currentQuestionId);
    if (!question) return;

    if (question.validator) {
      const validationError = question.validator(value, generator.formData);
      if (validationError !== true) {
        appendMessage({ id: `error_${Date.now()}`, sender: 'assistant', text: `\u26a0\ufe0f ${validationError}`, isError: true, timestamp: Date.now() });
        return;
      }
    }

    // copingTools is updated live by the Multi Select renderer; everything
    // else is written straight to the shared form state here.
    if (question.id !== 'copingTools') {
      updateForm(question.id, value);
    }

    const userMsg = {
      id: `user_${question.id}_${Date.now()}`,
      sender: 'user',
      text: formattedLabel || (typeof value === 'string' ? value : JSON.stringify(value)),
      timestamp: Date.now(),
    };

    const nextQId = engine.getNextQuestionId(currentQuestionId, { ...generator.formData, [question.id]: value });

    if (nextQId && nextQId !== 'done') {
      askQuestion(nextQId, userMsg);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => {
          const nextMsgs = [...prev, userMsg, {
            id: `assistant_review_${Date.now()}`,
            sender: 'assistant',
            text: 'That\'s everything! Here\'s a summary of your check-in — generate your reflection whenever you\'re ready.',
            questionId: 'review',
            timestamp: Date.now(),
          }];
          saveToCache(nextMsgs, 'review', [...historyPath, 'review']);
          return nextMsgs;
        });
        setCurrentQuestionId('review');
        setHistoryPath(prev => [...prev, 'review']);
      }, 500);
    }
  }, [currentQuestionId, engine, generator.formData, updateForm, askQuestion, appendMessage, saveToCache, historyPath]);

  return {
    ...generator,
    messages,
    currentQuestionId,
    isTyping,
    historyPath,
    showResumeDialog,
    restoreSession,
    discardSession,
    startConversation: () => askQuestion('currentFocus'),
    submitAnswer,
    handleCommand,
    progress: currentQuestionId
      ? engine.getProgress(currentQuestionId, generator.formData)
      : { percentage: 0, current: 0, total: 1, remaining: 1, estimatedTimeStr: '' },
  };
}
