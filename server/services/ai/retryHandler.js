/**
 * Exponential backoff retry handler.
 * Retries only on 429 (rate limit) and 5xx (server) errors.
 */

const DEFAULT_DELAYS = [2000, 5000, 10000]; // 2s, 5s, 10s

/**
 * Wrap an async function with retry logic.
 * @param {() => Promise<T>} fn - The async function to retry
 * @param {object} [options]
 * @param {number[]} [options.delays] - Delay schedule in ms (default: [2000, 5000, 10000])
 * @param {(err: Error) => boolean} [options.shouldRetry] - Custom retry predicate
 * @returns {Promise<T>}
 * @template T
 */
export async function withRetry(fn, options = {}) {
  const delays = options.delays || DEFAULT_DELAYS;
  const shouldRetry = options.shouldRetry || defaultShouldRetry;
  const maxAttempts = delays.length + 1; // first attempt + retries

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt >= maxAttempts || !shouldRetry(err)) {
        throw err;
      }

      const delay = delays[attempt - 1];
      console.log(
        `[RetryHandler] Attempt ${attempt}/${maxAttempts} failed (${err.name || 'Error'}: ${err.message}). ` +
        `Retrying in ${delay / 1000}s...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Default retry predicate: retry on 429 and 5xx status codes.
 */
function defaultShouldRetry(err) {
  const status = err.status || 0;
  return status === 429 || status >= 500;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
