/**
 * Server-side prompt builder for MindForge's daily wellness reflection.
 * Takes a structured check-in and compiles a compact, token-efficient
 * prompt for Gemini to turn into a warm, supportive markdown reflection.
 */

export const SYSTEM_PROMPT = `You are a warm, supportive wellness journaling companion. You write short, personal, encouraging markdown reflections based on a person's daily check-in (mood, energy, sleep, goals, gratitude, and the coping tools they already use).

STRICT BOUNDARIES — these override everything else:
- You are NOT a therapist, doctor, or counselor. NEVER diagnose a condition, NEVER suggest medication, dosages, or specific treatments, and NEVER claim to know the cause of how someone feels.
- Never invent facts the person didn't share. Only reflect on what's actually in the check-in.
- Keep the tone gentle, validating, and non-judgmental — never clinical, never alarmist.
- If the check-in is marked SAFETY_FLAGGED, your response MUST open with a short, calm acknowledgment and clearly and warmly point to professional crisis support before anything else. Do not attempt to talk the person out of anything yourself, do not minimize what they shared, and do not skip this even if the rest of the entry seems mild.
- Always close with a one-line reminder that this reflection is not a substitute for professional mental health care.
- Output ONLY raw markdown, no code fences, no preamble, no emojis.

STRUCTURE (use these headings, skip a heading only if there's truly nothing to reflect on for it):
## Today's Reflection
## What You're Navigating
## Patterns Worth Noticing
## A Few Gentle Ideas
## Reminder`;

/**
 * @param {object} checkin - fields matching the Checkin model
 * @param {boolean} safetyFlagged - true if the crisis-language screen fired
 * @returns {{ prompt: string, systemPrompt: string, estimatedTokens: number }}
 */
export function buildOptimizedPrompt(checkin, safetyFlagged = false) {
  const lines = [];

  lines.push(`Write today's wellness reflection based on this check-in.`);
  if (safetyFlagged) {
    lines.push(`SAFETY_FLAGGED: true — follow the safety-boundary instructions exactly.`);
  }
  lines.push('');

  if (checkin.currentFocus) lines.push(`CURRENT LIFE FOCUS: ${checkin.currentFocus}`);
  if (checkin.intention) lines.push(`TODAY'S INTENTION: ${checkin.intention}`);

  if (isNum(checkin.mood)) lines.push(`MOOD (1-5, 5=great): ${checkin.mood}`);
  if (isNum(checkin.energy)) lines.push(`ENERGY (1-5, 5=high): ${checkin.energy}`);
  if (isNum(checkin.sleepHours)) lines.push(`SLEEP HOURS LAST NIGHT: ${checkin.sleepHours}`);
  if (isNum(checkin.sleepQuality)) lines.push(`SLEEP QUALITY (1-5, 5=great): ${checkin.sleepQuality}`);

  if (checkin.copingTools?.length) {
    lines.push(`COPING TOOLS / SUPPORT SYSTEMS THEY USE: ${checkin.copingTools.join(', ')}`);
  }
  if (checkin.copingNotes) lines.push(`NOTES ON COPING TODAY: ${checkin.copingNotes}`);

  if (checkin.goals) lines.push(`CURRENT WELLNESS GOALS: ${checkin.goals}`);
  if (checkin.milestones) lines.push(`RECENT MILESTONES / PROGRESS: ${checkin.milestones}`);
  if (checkin.gratitude) lines.push(`GRATITUDE / WHAT WENT WELL: ${checkin.gratitude}`);
  if (checkin.customNotes) lines.push(`ADDITIONAL NOTES: ${checkin.customNotes}`);

  const hasSupportContacts = checkin.supportContacts?.length > 0;
  if (hasSupportContacts) {
    lines.push(`HAS NAMED SUPPORT CONTACTS: yes (do not list their private details back, just acknowledge they have people they can lean on)`);
  }

  lines.push('');
  lines.push(`INSTRUCTIONS:`);
  lines.push(`- Write 150-300 words total.`);
  lines.push(`- Reference specific things they shared (mood/energy/sleep numbers, their own words) rather than generic advice.`);
  lines.push(`- In "A Few Gentle Ideas", suggest at most 2 small, doable next steps — prefer building on tools they already use over introducing new ones.`);
  lines.push(`- Second person ("you"), warm and human, never clinical jargon.`);
  lines.push(`- Output ONLY the markdown, starting directly with "## Today's Reflection".`);

  const prompt = compressPrompt(lines.join('\n'));
  const estimatedTokens = Math.ceil(prompt.length / 4);

  return { prompt, systemPrompt: SYSTEM_PROMPT, estimatedTokens };
}

function isNum(v) {
  return typeof v === 'number' && !Number.isNaN(v);
}

function compressPrompt(text) {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, i, arr) => !(!line && i > 0 && !arr[i - 1]))
    .join('\n')
    .trim();
}
