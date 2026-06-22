import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CloudflareVerifierAdapter,
  CLOUDFLARE_VERIFY_URL,
} from './cloudflare-verifier.adapter';
import { CloudflareToken } from '../../domain/value-objects/cloudflare-token';
import { InvalidApiTokenError } from '../../domain/errors/invalid-api-token.error';

const SECRET_TOKEN = 'super-secret-cf-token';

const okResponse = (status: string): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, result: { id: 'token-id', status } }),
  }) as unknown as Response;

const httpErrorResponse = (): Response =>
  ({
    ok: false,
    status: 401,
    json: async () => ({ success: false, errors: [] }),
  }) as unknown as Response;

describe('CloudflareVerifierAdapter', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a verified account when the token status is active', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse('active'));
    const adapter = new CloudflareVerifierAdapter(fetchMock);

    const result = await adapter.verify(CloudflareToken.create(SECRET_TOKEN));

    expect(result.status).toBe('active');
    expect(fetchMock).toHaveBeenCalledWith(
      CLOUDFLARE_VERIFY_URL,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${SECRET_TOKEN}` }),
      }),
    );
  });

  it('throws InvalidApiTokenError when status is not active', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse('disabled'));
    const adapter = new CloudflareVerifierAdapter(fetchMock);

    await expect(adapter.verify(CloudflareToken.create(SECRET_TOKEN))).rejects.toBeInstanceOf(
      InvalidApiTokenError,
    );
  });

  it('throws InvalidApiTokenError on an HTTP error response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(httpErrorResponse());
    const adapter = new CloudflareVerifierAdapter(fetchMock);

    await expect(adapter.verify(CloudflareToken.create(SECRET_TOKEN))).rejects.toBeInstanceOf(
      InvalidApiTokenError,
    );
  });

  it('throws InvalidApiTokenError on a network failure', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    const adapter = new CloudflareVerifierAdapter(fetchMock);

    await expect(adapter.verify(CloudflareToken.create(SECRET_TOKEN))).rejects.toBeInstanceOf(
      InvalidApiTokenError,
    );
  });

  it('never logs the token in any stdout/stderr output', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse('active'));
    const adapter = new CloudflareVerifierAdapter(fetchMock);

    await adapter.verify(CloudflareToken.create(SECRET_TOKEN));

    const allLogs = [...logSpy.mock.calls, ...errorSpy.mock.calls]
      .flat()
      .map((entry) => String(entry))
      .join(' ');
    expect(allLogs).not.toContain(SECRET_TOKEN);
  });
});
