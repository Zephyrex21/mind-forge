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
  /\bcan'?t go on (anymore|any more|like this)\b/i,
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
    region: 'India · Government of India',
    name: 'Tele-MANAS (Ministry of Health & Family Welfare)',
    contact: 'Call 14416 or 1-800-891-4416 (toll-free, 24/7, 20 languages)',
  },
  {
    region: 'India · Government of India',
    name: 'KIRAN Mental Health Rehabilitation Helpline (Ministry of Social Justice & Empowerment)',
    contact: 'Call 1800-599-0019 (toll-free, 24/7)',
  },
  {
    region: 'India',
    name: 'National Emergency Number',
    contact: 'Call 112 for immediate, life-threatening emergencies',
  },
];
