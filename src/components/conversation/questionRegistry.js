import { COPING_TOOL_OPTIONS } from '../../constants/options';

const SCALE_LABELS = ['1 · Low', '2', '3 · Okay', '4', '5 · Great'];
const scaleOptions = () => [1, 2, 3, 4, 5].map((n, i) => ({ value: n, label: SCALE_LABELS[i] }));

/**
 * Daily Check-in conversational flow.
 * Replaces the old GitHub-profile question flow (PROFILE_QUESTIONS).
 */
export const CHECKIN_QUESTIONS = [
  {
    id: 'currentFocus',
    section: 'About You',
    label: 'Current Focus',
    description: "What's your current focus in life right now?",
    placeholder: 'e.g. starting a new job, recovering from a rough patch...',
    component: 'Text',
    next: 'intention',
  },
  {
    id: 'intention',
    section: 'About You',
    label: "Today's Intention",
    description: "What's your intention for today? (optional)",
    placeholder: 'Be a little kinder to myself today',
    component: 'Text',
    next: 'mood',
  },
  {
    id: 'mood',
    section: 'Mood & Energy',
    label: 'Mood',
    description: "How's your mood today?",
    component: 'Dropdown',
    options: scaleOptions(),
    next: 'energy',
  },
  {
    id: 'energy',
    section: 'Mood & Energy',
    label: 'Energy',
    description: "How's your energy level?",
    component: 'Dropdown',
    options: scaleOptions(),
    next: 'sleepHours',
  },
  {
    id: 'sleepHours',
    section: 'Mood & Energy',
    label: 'Sleep',
    description: 'How many hours did you sleep last night?',
    placeholder: 'e.g. 7.5',
    component: 'Text',
    next: 'sleepQuality',
  },
  {
    id: 'sleepQuality',
    section: 'Mood & Energy',
    label: 'Sleep Quality',
    description: 'How would you rate your sleep quality?',
    component: 'Dropdown',
    options: scaleOptions(),
    next: 'copingTools',
  },
  {
    id: 'copingTools',
    section: 'Coping Tools',
    label: 'Coping Tools',
    description: 'What helps you get through hard moments? Pick everything that applies.',
    component: 'Multi Select',
    options: COPING_TOOL_OPTIONS,
    next: 'goals',
  },
  {
    id: 'goals',
    section: 'Wellness Goals',
    label: 'Current Goals',
    description: "What are you working toward right now? (optional)",
    placeholder: 'Sleep 7+ hours consistently, go for a walk 3x a week...',
    component: 'Textarea',
    next: 'milestones',
  },
  {
    id: 'milestones',
    section: 'Milestones',
    label: 'Milestones',
    description: "What have you accomplished lately, however small? (optional)",
    placeholder: 'Finished a 30-day meditation streak, got through a tough week...',
    component: 'Textarea',
    next: 'gratitude',
  },
  {
    id: 'gratitude',
    section: 'Gratitude',
    label: 'Gratitude',
    description: 'What went well today, even something small? (optional)',
    placeholder: 'My friend checked in on me today...',
    component: 'Textarea',
    next: 'customNotes',
  },
  {
    id: 'customNotes',
    section: 'Custom Notes',
    label: 'Anything Else',
    description: "Anything else on your mind that doesn't fit elsewhere? (optional)",
    placeholder: 'Free-write anything here...',
    component: 'Textarea',
    next: 'review',
  },
  {
    id: 'review',
    section: 'Preview',
    label: 'Review Check-in',
    description: 'Review your check-in before generating your reflection.',
    component: 'Review Screen',
    next: 'done',
  },
];

// Kept for backward compatibility with any lingering imports.
export const PROFILE_QUESTIONS = CHECKIN_QUESTIONS;
