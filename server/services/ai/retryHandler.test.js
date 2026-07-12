import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from './retryHandler.js';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the result immediately on first success (no retry needed)', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries once on a 429 and then succeeds', async () => {
    const err429 = Object.assign(new Error('rate limited'), { status: 429 });
    const fn = vi.fn()
      .mockRejectedValueOnce(err429)
      .mockResolvedValueOnce('ok after retry');

    const promise = withRetry(fn);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok after retry');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on 5xx errors', async () => {
    const err500 = Object.assign(new Error('server error'), { status: 500 });
    const fn = vi.fn()
      .mockRejectedValueOnce(err500)
      .mockResolvedValueOnce('recovered');

    const promise = withRetry(fn);
    await vi.runAllTimersAsync();
    expect(await promise).toBe('recovered');
  });

  it('does NOT retry on a 400 (client error) — fails immediately', async () => {
    const err400 = Object.assign(new Error('bad request'), { status: 400 });
    const fn = vi.fn().mockRejectedValue(err400);

    await expect(withRetry(fn)).rejects.toThrow('bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on a 401 (auth error)', async () => {
    const err401 = Object.assign(new Error('unauthorized'), { status: 401 });
    const fn = vi.fn().mockRejectedValue(err401);

    await expect(withRetry(fn)).rejects.toThrow('unauthorized');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('gives up after exhausting the retry budget (only 1 retry by default)', async () => {
    const err500 = Object.assign(new Error('still failing'), { status: 500 });
    const fn = vi.fn().mockRejectedValue(err500);

    const expectation = expect(withRetry(fn)).rejects.toThrow('still failing');
    await vi.runAllTimersAsync();
    await expectation;
    // 1 initial attempt + 1 retry = 2 total calls, matching DEFAULT_DELAYS = [1500]
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('respects a custom shouldRetry predicate', async () => {
    const customErr = new Error('custom retryable error');
    const fn = vi.fn()
      .mockRejectedValueOnce(customErr)
      .mockResolvedValueOnce('ok');

    const promise = withRetry(fn, { shouldRetry: () => true, delays: [100] });
    await vi.runAllTimersAsync();
    expect(await promise).toBe('ok');
  });
});
