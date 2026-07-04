/**
 * Lightweight, keyword-based crisis-language screen.
 *
 * This is intentionally simple and high-recall, not a clinical tool: it
 * exists to make sure real crisis resources are surfaced quickly, never to
 * gate, block, or "handle" a crisis on its own. When it fires, the caller
 * should always route the person to real human help — the AI must never
 * attempt to counsel a flagged entry itself.
 */

const CRISIS_PATTERNS = [
  /\bkill(ing)? myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend(ing)? my life\b/i,
  /\bwant(ed)? to die\b/i,
  /\bno reason to live\b/i,
  /\bself[\s-]?harm\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bcan'?t go on\b/i,
  /\bbetter off (dead|without me)\b/i,
];

/**
 * @param {...(string|undefined)} texts - any number of free-text fields to scan
 * @returns {boolean} true if crisis-adjacent language was detected
 */
export function containsCrisisLanguage(...texts) {
  const combined = texts.filter(Boolean).join(' \n ');
  if (!combined.trim()) return false;
  return CRISIS_PATTERNS.some((pattern) => pattern.test(combined));
}

/**
 * Static crisis resources. Deliberately NOT AI-generated and NOT
 * conditional on model output — this must show up even if the AI call
 * fails entirely.
 */
export const CRISIS_RESOURCES = [
  {
    region: 'United States',
    name: '988 Suicide & Crisis Lifeline',
    contact: 'Call or text 988',
  },
  {
    region: 'United States',
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
  },
  {
    region: 'India',
    name: 'iCall (TISS)',
    contact: '+91 9152987821',
  },
  {
    region: 'International',
    name: 'Find A Helpline',
    contact: 'https://findahelpline.com',
  },
];
