import { describe, it, expect } from 'vitest';
import { CloudflareToken } from './cloudflare-token';

describe('CloudflareToken', () => {
  it('normalizes surrounding whitespace', () => {
    const token = CloudflareToken.create('  cf-token-123  ');
    expect(token.value).toBe('cf-token-123');
  });

  it('throws for an empty value', () => {
    expect(() => CloudflareToken.create('')).toThrow();
  });

  it('throws for a whitespace-only value', () => {
    expect(() => CloudflareToken.create('   ')).toThrow();
  });

  it('treats two equal normalized tokens as equal', () => {
    const a = CloudflareToken.create('same');
    const b = CloudflareToken.create('  same  ');
    expect(a.equals(b)).toBe(true);
  });
});
