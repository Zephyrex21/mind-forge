import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['**/*.test.js'],
    // perf/ is deliberately excluded — load tests run manually via
    // `npm run loadtest` (see vitest.loadtest.config.js), not as part of
    // the regular test suite or CI.
    exclude: ['node_modules', 'perf/**'],
  },
});
