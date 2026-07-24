import { defineConfig } from 'vitest/config';

/**
 * Separate config used only by `npm run loadtest` — deliberately points
 * at perf/ specifically, which the main vitest.config.js excludes from
 * the regular test run. Load tests are slow and their numbers vary with
 * whatever else is running on the machine, so they don't belong in the
 * fast, deterministic suite that runs on every push.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['perf/**/*.perf.js'],
    exclude: ['node_modules'],
  },
});
