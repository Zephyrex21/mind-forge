import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuth } from '../middleware/auth.js';
import { callGemini, GeminiRateLimitError, GeminiAuthError } from '../services/ai/geminiProvider.js';
import { withRetry } from '../services/ai/retryHandler.js';
import { hashKey, getCached, setCache, getCacheStats } from '../services/ai/cache.js';
import { buildOptimizedPrompt } from '../services/ai/promptOptimizer.js';
import { getModelChain, recordFailure, recordSuccess, getModelHealth } from '../services/ai/modelRouter.js';
import { getClientId, acquireSlot, releaseSlot } from '../services/ai/requestQueue.js';
import { containsCrisisLanguage, CRISIS_RESOURCES } from '../services/safety/keywordCheck.js';

const router = Router();

// Rate limit: 10/min for free & guest users, 60/min for premium.
// Keyed by authenticated user ID when available (falls back to IP for
// fully anonymous requests) so people behind a shared IP — office wifi,
// campus network, mobile carrier NAT — don't end up sharing one bucket.
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => req.user?.plan === 'premium' ? 60 : 10,
  keyGenerator: (req) => getClientId(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Generation rate limit reached. Please wait a moment.' },
});

/**
 * POST /api/generate
 * AI gateway: validate -> safety screen -> deduplicate -> cache check ->
 * build prompt -> model selection -> generate with retry + fallback -> cache.
 *
 * Request body: a check-in object (see models/Checkin.js for fields)
 * Response: { markdown, usage, cached, safetyFlagged, crisisResources? }
 */
router.post('/', optionalAuth, generateLimiter, async (req, res, next) => {
  const clientId = getClientId(req);

  try {
    const checkin = req.body || {};

    // --- Validate: at least one meaningful field must be present ---
    const hasContent = ['currentFocus', 'intention', 'copingNotes', 'goals', 'milestones', 'gratitude', 'customNotes']
      .some((k) => typeof checkin[k] === 'string' && checkin[k].trim().length > 0)
      || typeof checkin.mood === 'number'
      || typeof checkin.energy === 'number';

    if (!hasContent) {
      return res.status(400).json({ error: 'Add at least a mood/energy rating or a note before generating a reflection.' });
    }

    // --- Safety screen (never blocks generation, only flags it) ---
    const safetyFlagged = containsCrisisLanguage(
      checkin.copingNotes, checkin.goals, checkin.milestones,
      checkin.gratitude, checkin.customNotes, checkin.intention
    );

    // --- Deduplicate ---
    if (!acquireSlot(clientId)) {
      return res.status(409).json({ error: 'A generation is already in progress. Please wait for it to complete.' });
    }

    try {
      // --- Cache check (flagged entries always regenerate fresh) ---
      const cacheHash = hashKey(checkin, [safetyFlagged ? 'flagged' : 'ok']);
      const cachedMarkdown = !safetyFlagged ? getCached(cacheHash) : null;
      if (cachedMarkdown) {
        return res.json({
          markdown: cachedMarkdown,
          usage: { inputTokens: 0, outputTokens: 0, model: 'cache', cached: true },
          cached: true,
          safetyFlagged: false,
        });
      }

      // --- Build prompt ---
      const { prompt, systemPrompt, estimatedTokens } = buildOptimizedPrompt(checkin, safetyFlagged);
      console.log(`[Generate] Prompt built: ~${estimatedTokens} tokens${safetyFlagged ? ' [SAFETY FLAGGED]' : ''}`);

      // --- Model selection + generation with fallback ---
      const modelChain = getModelChain();
      let result = null;
      let lastError = null;
      let usedModel = null;

      for (const modelConfig of modelChain) {
        try {
          result = await withRetry(() =>
            callGemini({
              model: modelConfig.model,
              prompt,
              systemPrompt,
              maxOutputTokens: modelConfig.maxOutputTokens,
              temperature: modelConfig.temperature,
            })
          );
          usedModel = modelConfig.model;
          recordSuccess(modelConfig.model);
          break;
        } catch (err) {
          lastError = err;
          recordFailure(modelConfig.model);
          console.log(`[Generate] Model ${modelConfig.model} failed: ${err.message}`);
          if (err instanceof GeminiAuthError) break;
        }
      }

      if (!result) {
        const details = process.env.NODE_ENV === 'development' && lastError
          ? { message: lastError.message, status: lastError.status, details: lastError.details }
          : undefined;

        // Even if the AI call fails entirely, a flagged entry must still get
        // real resources back — never let an outage hide crisis support.
        if (safetyFlagged) {
          return res.status(200).json({
            markdown: null,
            usage: null,
            cached: false,
            safetyFlagged: true,
            crisisResources: CRISIS_RESOURCES,
            error: 'AI reflection could not be generated right now, but these resources are always available.',
          });
        }

        if (lastError instanceof GeminiAuthError) {
          return res.status(500).json({ error: 'Server AI configuration error. Contact admin.', debug: details });
        }
        if (lastError instanceof GeminiRateLimitError) {
          return res.status(429).json({ error: 'AI servers are busy. Please try again in a moment.', debug: details });
        }
        return res.status(502).json({ error: 'AI generation failed after all retries. Please try again shortly.', debug: details });
      }

      // --- Cache result (skip caching flagged entries) ---
      if (!safetyFlagged) {
        setCache(cacheHash, result.text);
      }

      return res.json({
        markdown: result.text,
        usage: { ...result.usage, cached: false },
        cached: false,
        safetyFlagged,
        ...(safetyFlagged ? { crisisResources: CRISIS_RESOURCES } : {}),
      });
    } finally {
      releaseSlot(clientId);
    }
  } catch (err) {
    releaseSlot(clientId);
    next(err);
  }
});

/**
 * GET /api/generate/health
 * Cache stats, model health, queue status (dev only).
 */
router.get('/health', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ cache: getCacheStats(), models: getModelHealth() });
});

export default router;
