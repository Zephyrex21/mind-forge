/**
 * Model routing with fallback chain and health tracking.
 * Primary model is cheapest/fastest; fallback is higher quality.
 */

const MODEL_CHAIN = [
  {
    id: 'primary',
    model: 'gemini-2.5-flash-lite',
    maxOutputTokens: 2000,
    temperature: 0.8,
    label: 'Fast',
  },
  {
    id: 'fallback',
    model: 'gemini-2.5-flash',
    maxOutputTokens: 1600,
    temperature: 0.8,
    label: 'Balanced',
  },
];

// Health tracking per model
const healthState = new Map();
const FAILURE_WINDOW_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_FAILURES = 3;
const COOLDOWN_MS = 2 * 60 * 1000;         // 2 minutes

function getHealth(model) {
  if (!healthState.has(model)) {
    healthState.set(model, { failures: [], cooldownUntil: 0 });
  }
  return healthState.get(model);
}

/**
 * Check if a model is currently healthy (not in cooldown).
 */
function isHealthy(model) {
  const health = getHealth(model);
  const now = Date.now();

  // If in cooldown, check if cooldown has expired
  if (health.cooldownUntil > now) {
    return false;
  }

  // Clean old failures outside the window
  health.failures = health.failures.filter(t => now - t < FAILURE_WINDOW_MS);

  return health.failures.length < MAX_FAILURES;
}

/**
 * Record a failure for a model.
 */
export function recordFailure(model) {
  const health = getHealth(model);
  health.failures.push(Date.now());

  // Clean old failures
  const now = Date.now();
  health.failures = health.failures.filter(t => now - t < FAILURE_WINDOW_MS);

  // If too many failures, enter cooldown
  if (health.failures.length >= MAX_FAILURES) {
    health.cooldownUntil = now + COOLDOWN_MS;
    console.log(`[ModelRouter] Model ${model} entered cooldown for ${COOLDOWN_MS / 1000}s`);
  }
}

/**
 * Record a success for a model — clears its failure history.
 */
export function recordSuccess(model) {
  const health = getHealth(model);
  health.failures = [];
  health.cooldownUntil = 0;
}

/**
 * Get the ordered list of models to try.
 * Unhealthy models are pushed to the end but not removed entirely.
 * @returns {Array<{ model: string, maxOutputTokens: number, temperature: number, label: string }>}
 */
export function getModelChain() {
  const healthy = MODEL_CHAIN.filter(m => isHealthy(m.model));
  const unhealthy = MODEL_CHAIN.filter(m => !isHealthy(m.model));

  // Healthy models first, unhealthy as last resort
  const chain = [...healthy, ...unhealthy];

  // Always return at least one model
  return chain.length > 0 ? chain : MODEL_CHAIN;
}

/**
 * Get the primary (first healthy) model config.
 */
export function getPrimaryModel() {
  return getModelChain()[0];
}

/**
 * Get health status for all models (for monitoring).
 */
export function getModelHealth() {
  return MODEL_CHAIN.map(m => ({
    model: m.model,
    label: m.label,
    healthy: isHealthy(m.model),
    failures: getHealth(m.model).failures.length,
    cooldownUntil: getHealth(m.model).cooldownUntil,
  }));
}
