import { describe, it, expect } from 'vitest';
import { apiEnvSchema } from './api-env';

describe('apiEnvSchema', () => {
  it('parses a valid environment', () => {
    const result = apiEnvSchema.parse({
      NODE_ENV: 'development',
      DATABASE_URL: 'file:./data/paulline.db',
      API_PORT: '3000',
    });

    expect(result.NODE_ENV).toBe('development');
    expect(result.API_PORT).toBe(3000);
  });

  it('applies defaults for NODE_ENV and API_PORT', () => {
    const result = apiEnvSchema.parse({
      DATABASE_URL: 'file:./data/paulline.db',
    });

    expect(result.NODE_ENV).toBe('development');
    expect(result.API_PORT).toBe(3000);
  });

  it('rejects an empty DATABASE_URL', () => {
    expect(() => apiEnvSchema.parse({ DATABASE_URL: '' })).toThrow();
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() =>
      apiEnvSchema.parse({
        NODE_ENV: 'staging',
        DATABASE_URL: 'file:./data/paulline.db',
      }),
    ).toThrow();
  });

  it('rejects a non-positive API_PORT', () => {
    expect(() =>
      apiEnvSchema.parse({
        DATABASE_URL: 'file:./data/paulline.db',
        API_PORT: '-1',
      }),
    ).toThrow();
  });
});
