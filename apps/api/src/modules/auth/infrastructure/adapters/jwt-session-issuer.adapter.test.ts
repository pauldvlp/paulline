import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';
import { JwtSessionIssuerAdapter } from './jwt-session-issuer.adapter';
import type { ConfigService } from '../../../../config/config.service';

const SECRET = 'this-is-a-very-long-jwt-secret-32chars';
const TTL_SECONDS = 3600;

const buildConfig = (ttl = TTL_SECONDS): ConfigService =>
  ({ authJwtSecret: SECRET, authSessionTtlSeconds: ttl }) as ConfigService;

describe('JwtSessionIssuerAdapter', () => {
  it('issues a session that verifies back to the same subject', async () => {
    const issuer = new JwtSessionIssuerAdapter(buildConfig());

    const session = await issuer.issue('credential-id-123');
    const verified = await issuer.verify(session.sessionToken);

    expect(verified.subjectId).toBe('credential-id-123');
  });

  it('sets an ISO expiry consistent with the configured TTL', async () => {
    const issuer = new JwtSessionIssuerAdapter(buildConfig());
    const before = Date.now();

    const session = await issuer.issue('credential-id-123');
    const expiresAtMs = Date.parse(session.expiresAt);

    expect(Number.isNaN(expiresAtMs)).toBe(false);
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + (TTL_SECONDS - 5) * 1000);
  });

  it('rejects a token signed with a different secret', async () => {
    const issuer = new JwtSessionIssuerAdapter(buildConfig());

    const foreignToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('credential-id-123')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode('a-different-secret-that-is-32-chars!!'));

    await expect(issuer.verify(foreignToken)).rejects.toThrow();
  });

  it('rejects an expired token', async () => {
    const issuer = new JwtSessionIssuerAdapter(buildConfig());

    const expiredToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('credential-id-123')
      .setIssuedAt(0)
      .setExpirationTime(1)
      .sign(new TextEncoder().encode(SECRET));

    await expect(issuer.verify(expiredToken)).rejects.toThrow();
  });

  it('rejects a malformed token', async () => {
    const issuer = new JwtSessionIssuerAdapter(buildConfig());
    await expect(issuer.verify('not-a-jwt')).rejects.toThrow();
  });
});
