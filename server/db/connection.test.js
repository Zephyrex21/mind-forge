import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function makeMongooseMock() {
  return {
    default: {
      set: vi.fn(),
      connect: vi.fn(),
      connection: {
        readyState: 0,
        name: 'testdb',
        on: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
      },
    },
  };
}

describe('connectDb', () => {
  const originalUri = process.env.MONGODB_URI;

  beforeEach(() => {
    vi.resetModules();
    process.env.MONGODB_URI = 'mongodb://fake-uri-for-tests/testdb';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
  });

  it('throws immediately if MONGODB_URI is not set, without attempting to connect', async () => {
    delete process.env.MONGODB_URI;
    vi.doMock('mongoose', makeMongooseMock);
    const mongoose = (await import('mongoose')).default;
    const { connectDb } = await import('./connection.js');

    await expect(connectDb()).rejects.toThrow('MONGODB_URI is not set');
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it('resolves on the first attempt with no retries needed', async () => {
    vi.doMock('mongoose', makeMongooseMock);
    const mongoose = (await import('mongoose')).default;
    mongoose.connect.mockResolvedValue({ connection: mongoose.connection });
    const { connectDb } = await import('./connection.js');

    await connectDb();
    expect(mongoose.connect).toHaveBeenCalledOnce();
  });

  it('retries with backoff after transient failures, then succeeds', async () => {
    vi.useFakeTimers();
    vi.doMock('mongoose', makeMongooseMock);
    const mongoose = (await import('mongoose')).default;
    mongoose.connect
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce({ connection: mongoose.connection });
    const { connectDb } = await import('./connection.js');

    const promise = connectDb({ maxRetries: 5, baseDelayMs: 10 });
    await vi.runAllTimersAsync();
    await promise;

    expect(mongoose.connect).toHaveBeenCalledTimes(3);
  });

  it('gives up and throws the last error after exhausting all retries', async () => {
    vi.useFakeTimers();
    vi.doMock('mongoose', makeMongooseMock);
    const mongoose = (await import('mongoose')).default;
    mongoose.connect.mockRejectedValue(new Error('still down'));
    const { connectDb } = await import('./connection.js');

    const promise = connectDb({ maxRetries: 3, baseDelayMs: 10 });
    // Attach the rejection handler before advancing timers so Node
    // doesn't flag it as an unhandled rejection mid-flight.
    const assertion = expect(promise).rejects.toThrow('still down');
    await vi.runAllTimersAsync();
    await assertion;

    expect(mongoose.connect).toHaveBeenCalledTimes(3);
  });

  it('allows a fresh retry sequence on the next call after a prior attempt fully failed', async () => {
    vi.useFakeTimers();
    vi.doMock('mongoose', makeMongooseMock);
    const mongoose = (await import('mongoose')).default;
    mongoose.connect.mockRejectedValue(new Error('down'));
    const { connectDb } = await import('./connection.js');

    const firstAttempt = expect(connectDb({ maxRetries: 1, baseDelayMs: 10 })).rejects.toThrow();
    await vi.runAllTimersAsync();
    await firstAttempt;

    mongoose.connect.mockResolvedValueOnce({ connection: mongoose.connection });
    await connectDb({ maxRetries: 1, baseDelayMs: 10 });

    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });

  it('skips connecting entirely if already connected (readyState 1)', async () => {
    vi.doMock('mongoose', () => {
      const mock = makeMongooseMock();
      mock.default.connection.readyState = 1;
      return mock;
    });
    const mongoose = (await import('mongoose')).default;
    const { connectDb } = await import('./connection.js');

    const result = await connectDb();
    expect(result).toBe(mongoose.connection);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });
});

describe('closeDb', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('closes the mongoose connection without force-closing in-progress operations', async () => {
    vi.doMock('mongoose', makeMongooseMock);
    const mongoose = (await import('mongoose')).default;
    const { closeDb } = await import('./connection.js');

    await closeDb();
    expect(mongoose.connection.close).toHaveBeenCalledWith(false);
  });
});
