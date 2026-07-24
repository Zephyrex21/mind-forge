import { describe, it, expect, vi } from 'vitest';
import { createShutdownHandler } from './shutdown.js';

function fakeLogger() {
  return { log: vi.fn(), error: vi.fn() };
}

describe('createShutdownHandler', () => {
  it('closes the HTTP server, then the DB connection, then exits 0 on success', async () => {
    const server = {
      close: vi.fn((cb) => cb(null)),
    };
    const closeDb = vi.fn().mockResolvedValue(undefined);
    const exit = vi.fn();
    const log = fakeLogger();

    const shutdown = createShutdownHandler({ server, closeDb, exit, log });
    shutdown('SIGTERM');

    // server.close's callback runs synchronously in this fake, but closeDb
    // is async — flush microtasks before asserting the final state.
    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));

    expect(server.close).toHaveBeenCalledOnce();
    expect(closeDb).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('exits 1 if the HTTP server fails to close cleanly', async () => {
    const server = {
      close: vi.fn((cb) => cb(new Error('server close failed'))),
    };
    const closeDb = vi.fn().mockResolvedValue(undefined);
    const exit = vi.fn();
    const log = fakeLogger();

    const shutdown = createShutdownHandler({ server, closeDb, exit, log });
    shutdown('SIGTERM');

    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));

    expect(exit).toHaveBeenCalledWith(1);
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Error while closing HTTP server'), 'server close failed');
  });

  it('still exits (0) even if closing the DB connection throws — a DB close failure should not hang shutdown', async () => {
    const server = {
      close: vi.fn((cb) => cb(null)),
    };
    const closeDb = vi.fn().mockRejectedValue(new Error('db close failed'));
    const exit = vi.fn();
    const log = fakeLogger();

    const shutdown = createShutdownHandler({ server, closeDb, exit, log });
    shutdown('SIGTERM');

    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Error closing database connection'), 'db close failed');
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('ignores a second shutdown signal instead of double-closing', async () => {
    const server = {
      close: vi.fn((cb) => cb(null)),
    };
    const closeDb = vi.fn().mockResolvedValue(undefined);
    const exit = vi.fn();
    const log = fakeLogger();

    const shutdown = createShutdownHandler({ server, closeDb, exit, log });
    shutdown('SIGTERM');
    shutdown('SIGTERM'); // duplicate signal, e.g. platform sends more than one

    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));

    expect(server.close).toHaveBeenCalledOnce();
  });

  it('force-exits with code 1 if shutdown does not complete before the timeout', async () => {
    vi.useFakeTimers();
    try {
      const server = { close: vi.fn() }; // never calls its callback — simulates a stuck connection
      const closeDb = vi.fn().mockResolvedValue(undefined);
      const exit = vi.fn();
      const log = fakeLogger();

      const shutdown = createShutdownHandler({ server, closeDb, exit, log, forceExitMs: 1000 });
      shutdown('SIGTERM');

      expect(exit).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);

      expect(exit).toHaveBeenCalledWith(1);
      expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Forced shutdown after timeout'));
    } finally {
      vi.useRealTimers();
    }
  });
});
