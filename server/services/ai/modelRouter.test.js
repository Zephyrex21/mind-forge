import { describe, it, expect, beforeEach, vi } from 'vitest';

// This module keeps health state at module scope, so each test gets a
// fresh, isolated instance via resetModules + a dynamic re-import.
async function freshRouter() {
  vi.resetModules();
  return import('./modelRouter.js');
}

describe('modelRouter', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('returns both models in the chain when everything is healthy', async () => {
    const { getModelChain } = await freshRouter();
    const chain = getModelChain();
    expect(chain).toHaveLength(2);
    expect(chain[0].model).toBe('gemini-2.5-flash-lite');
    expect(chain[1].model).toBe('gemini-2.5-flash');
  });

  it('never returns an empty chain', async () => {
    const { getModelChain } = await freshRouter();
    const chain = getModelChain();
    expect(chain.length).toBeGreaterThan(0);
  });

  it('pushes a model to the back of the chain after repeated failures', async () => {
    const { getModelChain, recordFailure } = await freshRouter();

    // Fail the primary model 3 times (MAX_FAILURES) to trip its cooldown
    recordFailure('gemini-2.5-flash-lite');
    recordFailure('gemini-2.5-flash-lite');
    recordFailure('gemini-2.5-flash-lite');

    const chain = getModelChain();
    // The failing model should now be last, not first
    expect(chain[0].model).toBe('gemini-2.5-flash');
    expect(chain[1].model).toBe('gemini-2.5-flash-lite');
  });

  it('does not enter cooldown after fewer than MAX_FAILURES', async () => {
    const { getModelChain, recordFailure } = await freshRouter();

    recordFailure('gemini-2.5-flash-lite');
    recordFailure('gemini-2.5-flash-lite'); // only 2 failures, threshold is 3

    const chain = getModelChain();
    expect(chain[0].model).toBe('gemini-2.5-flash-lite');
  });

  it('recordSuccess clears failure history for a model', async () => {
    const { getModelChain, recordFailure, recordSuccess } = await freshRouter();

    recordFailure('gemini-2.5-flash-lite');
    recordFailure('gemini-2.5-flash-lite');
    recordFailure('gemini-2.5-flash-lite');
    recordSuccess('gemini-2.5-flash-lite');

    const chain = getModelChain();
    // Should be back at the front since its failures were cleared
    expect(chain[0].model).toBe('gemini-2.5-flash-lite');
  });

  it('getModelHealth reports failure counts and health status', async () => {
    const { getModelHealth, recordFailure } = await freshRouter();

    recordFailure('gemini-2.5-flash-lite');
    const health = getModelHealth();

    const primary = health.find((h) => h.model === 'gemini-2.5-flash-lite');
    expect(primary.failures).toBe(1);
    expect(primary.healthy).toBe(true); // 1 failure is still under the threshold of 3
  });

  it('getPrimaryModel returns the first entry of the chain', async () => {
    const { getPrimaryModel, getModelChain } = await freshRouter();
    expect(getPrimaryModel().model).toBe(getModelChain()[0].model);
  });
});
