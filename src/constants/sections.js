import {
  User, Smile, HeartHandshake, Target, Trophy,
  Sparkles, Users, LifeBuoy, FileEdit,
} from 'lucide-react';

/**
 * The fixed sequence of check-in sections. Unlike the old README wizard,
 * there's no "pick which sections to include" step — a daily wellness
 * check-in is a short, consistent flow every time.
 */
export const SECTION_DEFS = [
  { key: 'about-you', name: 'About You', desc: "What's on your mind today", icon: User, required: true },
  { key: 'mood-energy', name: 'Mood & Energy', desc: 'How you slept, how you feel', icon: Smile, required: true },
  { key: 'coping-tools', name: 'Coping Tools', desc: 'What helps you through the day', icon: HeartHandshake, required: false },
  { key: 'goals', name: 'Wellness Goals', desc: "What you're working toward", icon: Target, required: false },
  { key: 'milestones', name: 'Milestones', desc: 'Progress worth celebrating', icon: Trophy, required: false },
  { key: 'gratitude', name: 'Gratitude', desc: 'What went well today', icon: Sparkles, required: false },
  { key: 'support-contacts', name: 'Support Contacts', desc: 'People you can lean on', icon: Users, required: false },
  { key: 'crisis-resources', name: 'Crisis Resources', desc: 'Always here if you need them', icon: LifeBuoy, required: true },
  { key: 'custom', name: 'Custom Notes', desc: 'Anything else on your mind', icon: FileEdit, required: false },
];
