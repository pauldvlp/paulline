import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthClient } from './AuthClient';
import { PaulineError } from './PaulineError';

const BASE_URL = 'http://localhost:3000';

const jsonResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as Response;

describe('AuthClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('login posts the api token and stores the returned session token in memory', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { sessionToken: 'jwt.session.token', expiresAt: '2026-06-23T00:00:00.000Z' }),
    );
    const client = new AuthClient(BASE_URL, fetchMock);

    const session = await client.login({ apiToken: 'cf-token' });

    expect(session.sessionToken).toBe('jwt.session.token');
    expect(client.getSessionToken()).toBe('jwt.session.token');
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ apiToken: 'cf-token' }),
      }),
    );
  });

  it('attaches the bearer token to subsequent requests after login', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(200, { sessionToken: 'jwt.session.token', expiresAt: '2026-06-23T00:00:00.000Z' }),
      )
      .mockResolvedValueOnce(jsonResponse(204, {}));

    const client = new AuthClient(BASE_URL, fetchMock);
    await client.login({ apiToken: 'cf-token' });
    await client.logout();

    const logoutCall = fetchMock.mock.calls[1];
    expect(logoutCall[1].headers).toMatchObject({ Authorization: 'Bearer jwt.session.token' });
  });

  it('throws a typed PaulineError with the server error code on a 401', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, {
        error: { code: 'INVALID_API_TOKEN', message: 'Invalid API key. Check credentials at https://dash.cloudflare.com' },
      }),
    );
    const client = new AuthClient(BASE_URL, fetchMock);

    await expect(client.login({ apiToken: 'bad' })).rejects.toBeInstanceOf(PaulineError);
    await expect(client.login({ apiToken: 'bad' })).rejects.toMatchObject({
      code: 'INVALID_API_TOKEN',
    });
  });

  it('logout clears the in-memory session token', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(200, { sessionToken: 'jwt.session.token', expiresAt: '2026-06-23T00:00:00.000Z' }),
      )
      .mockResolvedValueOnce(jsonResponse(204, {}));

    const client = new AuthClient(BASE_URL, fetchMock);
    await client.login({ apiToken: 'cf-token' });
    await client.logout();

    expect(client.getSessionToken()).toBeNull();
  });

  it('setSessionToken updates and clears the in-memory token', () => {
    const client = new AuthClient(BASE_URL, fetchMock);
    client.setSessionToken('restored.token');
    expect(client.getSessionToken()).toBe('restored.token');
    client.setSessionToken(null);
    expect(client.getSessionToken()).toBeNull();
  });
});
