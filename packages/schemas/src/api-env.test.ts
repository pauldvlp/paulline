import { describe, it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import { apiEnvSchema } from './api-env';

const validEncryptionKey = randomBytes(32).toString('base64');
const validJwtSecret = 'a'.repeat(32);

const baseEnv = {
  DATABASE_URL: 'file:./data/paulline.db',
  AUTH_ENCRYPTION_KEY: validEncryptionKey,
  AUTH_JWT_SECRET: validJwtSecret,
};

describe('apiEnvSchema', () => {
  it('parses a valid environment', () => {
    const result = apiEnvSchema.parse({
      ...baseEnv,
      NODE_ENV: 'development',
      API_PORT: '3000',
      AUTH_SESSION_TTL_SECONDS: '3600',
    });

    expect(result.NODE_ENV).toBe('development');
    expect(result.API_PORT).toBe(3000);
    expect(result.AUTH_ENCRYPTION_KEY).toBe(validEncryptionKey);
    expect(result.AUTH_SESSION_TTL_SECONDS).toBe(3600);
  });

  it('applies defaults for NODE_ENV, API_PORT and AUTH_SESSION_TTL_SECONDS', () => {
    const result = apiEnvSchema.parse(baseEnv);

    expect(result.NODE_ENV).toBe('development');
    expect(result.API_PORT).toBe(3000);
    expect(result.AUTH_SESSION_TTL_SECONDS).toBe(86400);
  });

  it('rejects an empty DATABASE_URL', () => {
    expect(() => apiEnvSchema.parse({ ...baseEnv, DATABASE_URL: '' })).toThrow();
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() =>
      apiEnvSchema.parse({
        ...baseEnv,
        NODE_ENV: 'staging',
      }),
    ).toThrow();
  });

  it('rejects a non-positive API_PORT', () => {
    expect(() =>
      apiEnvSchema.parse({
        ...baseEnv,
        API_PORT: '-1',
      }),
    ).toThrow();
  });

  it('rejects an encryption key that does not decode to 32 bytes', () => {
    expect(() =>
      apiEnvSchema.parse({
        ...baseEnv,
        AUTH_ENCRYPTION_KEY: randomBytes(16).toString('base64'),
      }),
    ).toThrow();
  });

  it('accepts an encryption key that decodes to exactly 32 bytes', () => {
    const result = apiEnvSchema.parse(baseEnv);
    expect(Buffer.from(result.AUTH_ENCRYPTION_KEY, 'base64').length).toBe(32);
  });

  it('rejects a JWT secret shorter than 32 characters', () => {
    expect(() =>
      apiEnvSchema.parse({
        ...baseEnv,
        AUTH_JWT_SECRET: 'too-short',
      }),
    ).toThrow();
  });
});
