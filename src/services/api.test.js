import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api';

function jsonResponse(body, { status = 200, ok = status < 400 } = {}) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  };
}

describe('api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('always sends the CSRF protection header, even on a plain GET', async () => {
    fetch.mockResolvedValue(jsonResponse({ ok: true }));
    await api.get('/api/goals');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['X-Requested-With']).toBe('mindforge');
  });

  it('sends the CSRF header on mutating requests too', async () => {
    fetch.mockResolvedValue(jsonResponse({ ok: true }, { status: 201 }));
    await api.post('/api/goals', { title: 'Test goal' });

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['X-Requested-With']).toBe('mindforge');
    expect(options.method).toBe('POST');
  });

  it('always sends credentials: include (cookie-based auth requires this cross-origin)', async () => {
    fetch.mockResolvedValue(jsonResponse({}));
    await api.get('/api/goals');

    const [, options] = fetch.mock.calls[0];
    expect(options.credentials).toBe('include');
  });

  it('sets Content-Type and the CSRF header together on every request (the merge that must never silently drop one)', async () => {
    fetch.mockResolvedValue(jsonResponse({}));
    await api.get('/api/goals');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['X-Requested-With']).toBe('mindforge');
  });

  it('dispatches a mindforge:unauthorized event on a 401 response', async () => {
    fetch.mockResolvedValue(jsonResponse({ error: 'Unauthorized' }, { status: 401 }));
    const handler = vi.fn();
    window.addEventListener('mindforge:unauthorized', handler);

    await expect(api.get('/api/goals')).rejects.toThrow();
    expect(handler).toHaveBeenCalledOnce();

    window.removeEventListener('mindforge:unauthorized', handler);
  });

  it('throws a network error with status 0 when fetch itself fails', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.get('/api/goals')).rejects.toMatchObject({ status: 0 });
  });

  it('returns parsed JSON on success', async () => {
    fetch.mockResolvedValue(jsonResponse({ items: [1, 2, 3] }));
    const result = await api.get('/api/goals');
    expect(result).toEqual({ items: [1, 2, 3] });
  });

  it('throws with the server-provided error message on a non-2xx response', async () => {
    fetch.mockResolvedValue(jsonResponse({ error: 'Not found' }, { status: 404 }));
    await expect(api.get('/api/goals/missing')).rejects.toThrow('Not found');
  });
});
