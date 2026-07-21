import { describe, it, expect, vi, afterEach } from 'vitest';
import { reportError } from './errorReporter.js';

describe('reportError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs a single JSON-parseable line to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    reportError(new Error('boom'));

    expect(spy).toHaveBeenCalledOnce();
    const logged = JSON.parse(spy.mock.calls[0][0]);
    expect(logged.level).toBe('error');
    expect(logged.message).toBe('boom');
    expect(logged.name).toBe('Error');
    expect(logged).toHaveProperty('timestamp');
  });

  it('includes extra context fields (requestId, userId, etc.) in the logged entry', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    reportError(new Error('boom'), { requestId: 'req-123', userId: 'user-456', path: '/api/goals' });

    const logged = JSON.parse(spy.mock.calls[0][0]);
    expect(logged.requestId).toBe('req-123');
    expect(logged.userId).toBe('user-456');
    expect(logged.path).toBe('/api/goals');
  });

  it('includes the stack trace', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('boom');
    reportError(err);

    const logged = JSON.parse(spy.mock.calls[0][0]);
    expect(logged.stack).toBe(err.stack);
  });
});
