import { describe, it, expect } from 'vitest';
import { loginSchema, authSessionSchema } from './auth';

describe('loginSchema', () => {
  it('accepts a non-empty api token and trims surrounding whitespace', () => {
    const result = loginSchema.parse({ apiToken: '  cf-token-123  ' });
    expect(result.apiToken).toBe('cf-token-123');
  });

  it('rejects an empty api token', () => {
    expect(() => loginSchema.parse({ apiToken: '' })).toThrow();
  });

  it('rejects a whitespace-only api token', () => {
    expect(() => loginSchema.parse({ apiToken: '   ' })).toThrow();
  });

  it('rejects a missing api token', () => {
    expect(() => loginSchema.parse({})).toThrow();
  });
});

describe('authSessionSchema', () => {
  it('accepts a session token and ISO expiry', () => {
    const result = authSessionSchema.parse({
      sessionToken: 'jwt.token.value',
      expiresAt: '2026-06-22T00:00:00.000Z',
    });
    expect(result.sessionToken).toBe('jwt.token.value');
    expect(result.expiresAt).toBe('2026-06-22T00:00:00.000Z');
  });

  it('rejects an empty session token', () => {
    expect(() =>
      authSessionSchema.parse({ sessionToken: '', expiresAt: '2026-06-22T00:00:00.000Z' }),
    ).toThrow();
  });
});
