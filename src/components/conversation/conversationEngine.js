/**
 * Pure JavaScript Conversational Engine.
 * Responsible for resolving the sequence of questions, conditional logic,
 * navigation history, and progress calculations.
 */

export class ConversationEngine {
  constructor(questions, builderType) {
    this.questions = questions;
    this.builderType = builderType;
  }

  /**
   * Find a question by its unique ID
   */
  getQuestion(id) {
    return this.questions.find(q => q.id === id);
  }

  /**
   * Determine the next question ID based on current answers
   */
  getNextQuestionId(currentId, formData) {
    const q = this.getQuestion(currentId);
    if (!q) return null;

    if (typeof q.next === 'function') {
      return q.next(formData);
    }
    return q.next;
  }

  /**
   * Resolve the active flow of questions from start to finish
   * based on the current state.
   */
  getActiveQuestionsPath(formData) {
    const path = [];
    const visited = new Set();
    let currentId = this.questions[0]?.id;

    while (currentId && currentId !== 'done' && currentId !== 'review') {
      if (visited.has(currentId)) {
        // Break infinite loops
        break;
      }
      visited.add(currentId);

      const q = this.getQuestion(currentId);
      if (!q) break;

      path.push(q);
      const nextId = this.getNextQuestionId(currentId, formData);
      currentId = nextId;
    }

    // Add review section if it exists
    const reviewQ = this.getQuestion('review');
    if (reviewQ) {
      path.push(reviewQ);
    }

    return path;
  }

  /**
   * Calculate progress statistics
   */
  getProgress(currentId, formData) {
    const path = this.getActiveQuestionsPath(formData);
    const currentIndex = path.findIndex(q => q.id === currentId);

    if (currentIndex === -1) {
      return {
        percentage: 0,
        current: 0,
        total: path.length,
        remaining: path.length,
        estimatedTimeStr: 'Est. 5 mins'
      };
    }

    const remaining = path.length - currentIndex - 1;
    // Calculate percentage based on current question position in the active path
    const percentage = Math.round((currentIndex / Math.max(1, path.length - 1)) * 100);
    const estSeconds = remaining * 15; // 15s average per question
    const estMinutes = Math.max(1, Math.ceil(estSeconds / 60));

    return {
      percentage: Math.min(100, percentage),
      current: currentIndex + 1,
      total: path.length,
      remaining,
      estimatedTimeStr: `${estMinutes} min${estMinutes > 1 ? 's' : ''}`
    };
  }
}

export default ConversationEngine;
