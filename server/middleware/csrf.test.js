import { describe, it, expect, vi } from 'vitest';
import { requireCsrfHeader, CSRF_HEADER, CSRF_HEADER_VALUE } from './csrf.js';

function mockReqRes(method, headers = {}) {
  const req = { method, headers };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req, res };
}

describe('requireCsrfHeader', () => {
  it.each(['GET', 'HEAD', 'OPTIONS'])('always allows safe method %s through, header or not', (method) => {
    const { req, res } = mockReqRes(method);
    const next = vi.fn();

    requireCsrfHeader(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('rejects %s with 403 when the header is missing', (method) => {
    const { req, res } = mockReqRes(method);
    const next = vi.fn();

    requireCsrfHeader(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('allows %s through when the correct header is present', (method) => {
    const { req, res } = mockReqRes(method, { [CSRF_HEADER]: CSRF_HEADER_VALUE });
    const next = vi.fn();

    requireCsrfHeader(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects a mutating request with the wrong header value', () => {
    const { req, res } = mockReqRes('POST', { [CSRF_HEADER]: 'something-else' });
    const next = vi.fn();

    requireCsrfHeader(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
