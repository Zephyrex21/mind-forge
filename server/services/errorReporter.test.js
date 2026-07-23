import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocked so tests never make a real network call to Sentry, and so we can
// assert exactly how/when the SDK gets called.
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
}));

describe('errorReporter', () => {
  const originalDsn = process.env.SENTRY_DSN;

  beforeEach(() => {
    vi.resetModules(); // fresh module state (sentryEnabled) for every test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalDsn === undefined) delete process.env.SENTRY_DSN;
    else process.env.SENTRY_DSN = originalDsn;
  });

  describe('without SENTRY_DSN configured', () => {
    beforeEach(() => {
      delete process.env.SENTRY_DSN;
    });

    it('initSentry() returns false and never calls Sentry.init', async () => {
      const Sentry = await import('@sentry/node');
      const { initSentry } = await import('./errorReporter.js');

      expect(initSentry()).toBe(false);
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('isSentryEnabled() stays false', async () => {
      const { initSentry, isSentryEnabled } = await import('./errorReporter.js');
      initSentry();
      expect(isSentryEnabled()).toBe(false);
    });

    it('reportError() still logs to console but never calls Sentry.captureException', async () => {
      const Sentry = await import('@sentry/node');
      const { initSentry, reportError } = await import('./errorReporter.js');
      initSentry();

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      reportError(new Error('boom'));

      expect(spy).toHaveBeenCalledOnce();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('with SENTRY_DSN configured', () => {
    beforeEach(() => {
      process.env.SENTRY_DSN = 'https://fake-key@o0.ingest.sentry.io/0';
    });

    it('initSentry() returns true and calls Sentry.init with the DSN', async () => {
      const Sentry = await import('@sentry/node');
      const { initSentry } = await import('./errorReporter.js');

      expect(initSentry()).toBe(true);
      expect(Sentry.init).toHaveBeenCalledOnce();
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({ dsn: 'https://fake-key@o0.ingest.sentry.io/0' })
      );
    });

    it('isSentryEnabled() becomes true after initSentry()', async () => {
      const { initSentry, isSentryEnabled } = await import('./errorReporter.js');
      initSentry();
      expect(isSentryEnabled()).toBe(true);
    });

    it('reportError() logs to console AND forwards to Sentry.captureException with context', async () => {
      const Sentry = await import('@sentry/node');
      const { initSentry, reportError } = await import('./errorReporter.js');
      initSentry();

      vi.spyOn(console, 'error').mockImplementation(() => {});
      const err = new Error('boom');
      reportError(err, { requestId: 'req-123' });

      expect(Sentry.captureException).toHaveBeenCalledOnce();
      expect(Sentry.captureException).toHaveBeenCalledWith(err, { extra: { requestId: 'req-123' } });
    });

    it('does not call Sentry.captureException if reportError runs before initSentry()', async () => {
      const Sentry = await import('@sentry/node');
      const { reportError } = await import('./errorReporter.js');
      // Deliberately not calling initSentry() here.

      vi.spyOn(console, 'error').mockImplementation(() => {});
      reportError(new Error('too early'));

      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('logged entry shape (unaffected by Sentry configuration)', () => {
    beforeEach(() => {
      delete process.env.SENTRY_DSN;
    });

    it('logs a single JSON-parseable line with the expected fields', async () => {
      const { reportError } = await import('./errorReporter.js');
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const err = new Error('boom');

      reportError(err, { requestId: 'req-123', userId: 'user-456', path: '/api/goals' });

      expect(spy).toHaveBeenCalledOnce();
      const logged = JSON.parse(spy.mock.calls[0][0]);
      expect(logged.level).toBe('error');
      expect(logged.message).toBe('boom');
      expect(logged.name).toBe('Error');
      expect(logged.stack).toBe(err.stack);
      expect(logged.requestId).toBe('req-123');
      expect(logged.userId).toBe('user-456');
      expect(logged.path).toBe('/api/goals');
      expect(logged).toHaveProperty('timestamp');
    });
  });
});
