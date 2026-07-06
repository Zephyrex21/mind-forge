/**
 * Low-level Gemini API provider.
 * Single responsibility: send one request, parse response, throw typed errors.
 */

const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 20_000;

// --- Typed Errors ---

export class GeminiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
    this.details = details;
  }
}

export class GeminiRateLimitError extends GeminiError {
  constructor(details) {
    super('Gemini API rate limit exceeded', 429, details);
    this.name = 'GeminiRateLimitError';
  }
}

export class GeminiAuthError extends GeminiError {
  constructor(details) {
    super('Invalid Gemini API key', 401, details);
    this.name = 'GeminiAuthError';
  }
}

export class GeminiServerError extends GeminiError {
  constructor(status, details) {
    super(`Gemini server error (${status})`, status, details);
    this.name = 'GeminiServerError';
  }
}

// --- Provider ---

/**
 * Call the Gemini generateContent API.
 * @param {object} options
 * @param {string} options.model - Model name (e.g. 'gemini-2.5-flash-lite')
 * @param {string} options.prompt - User prompt text
 * @param {string} [options.systemPrompt] - System instruction text
 * @param {number} [options.maxOutputTokens=4000]
 * @param {number} [options.temperature=0.8]
 * @returns {Promise<{ text: string, usage: { inputTokens: number, outputTokens: number, model: string } }>}
 */
export async function callGemini({ model, prompt, systemPrompt, maxOutputTokens = 4000, temperature = 0.8 }) {
  const apiKey = GEMINI_API_KEY();
  if (!apiKey) {
    throw new GeminiError('GEMINI_API_KEY not configured in server .env', 500);
  }

  const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: Math.min(maxOutputTokens, 8000),
        temperature: Math.min(Math.max(temperature, 0), 1),
      },
    };

    if (systemPrompt) {
      body.system_instruction = { parts: [{ text: systemPrompt }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error(`[GeminiProvider] API error ${res.status} for model ${model}:`, JSON.stringify(errData).slice(0, 500));

      if (res.status === 429) throw new GeminiRateLimitError(errData);
      if (res.status === 401 || res.status === 403) throw new GeminiAuthError(errData);
      if (res.status >= 500) throw new GeminiServerError(res.status, errData);
      throw new GeminiError(`Gemini API error (${res.status})`, res.status, errData);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    let text = candidate?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences that Gemini sometimes wraps around output
    text = text.replace(/^```(?:markdown|md)?\n?/i, '').replace(/\n?```\s*$/i, '');

    // Gemini can return HTTP 200 with no usable text at all — blocked by its
    // own safety filters, hit a recitation check, or some other non-STOP
    // finish reason. Silently returning that as a "successful" empty
    // reflection would look exactly like a broken/fake result to the user;
    // treat it as a failure instead so the model-fallback chain (and the
    // model above it in generate.js) gets a real chance to recover.
    if (!text.trim()) {
      const finishReason = candidate?.finishReason || 'UNKNOWN';
      throw new GeminiError(`Gemini returned no usable content (finishReason: ${finishReason})`, 502, { finishReason, candidate });
    }

    const usage = data?.usageMetadata || {};

    return {
      text,
      usage: {
        inputTokens: usage.promptTokenCount || 0,
        outputTokens: usage.candidatesTokenCount || 0,
        model,
      },
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new GeminiError(`Gemini API request timed out after ${TIMEOUT_MS / 1000}s`, 408);
    }
    // Re-throw typed errors
    if (err instanceof GeminiError) throw err;
    // Wrap unknown errors
    throw new GeminiError(`Network error: ${err.message}`, 0);
  } finally {
    clearTimeout(timeout);
  }
}
