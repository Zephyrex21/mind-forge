/**
 * Default form data for the daily wellness check-in wizard.
 * Field names match the backend Checkin schema (server/models/Checkin.js)
 * so the object can be POSTed to /api/generate and /api/checkins as-is.
 */
export const INITIAL_FORM_DATA = {
  // About You
  currentFocus: '',
  intention: '',

  // Mood & Energy
  mood: 3,
  energy: 3,
  sleepHours: '',
  sleepQuality: 3,

  // Coping Tools & Support Systems
  copingTools: [],
  copingNotes: '',

  // Wellness Goals
  goals: '',

  // Wellness Milestones
  milestones: '',

  // Gratitude / Reflection
  gratitude: '',

  // Support Contacts (private, optional)
  supportContacts: [],

  // Custom Notes
  customNotes: '',
};
