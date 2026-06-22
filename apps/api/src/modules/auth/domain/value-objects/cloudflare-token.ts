import { InvalidApiTokenError } from '../errors/invalid-api-token.error';

export class CloudflareToken {
  private constructor(readonly value: string) {}

  static create(raw: string): CloudflareToken {
    const normalized = raw.trim();

    if (normalized.length === 0) {
      throw new InvalidApiTokenError('Cloudflare API token must not be empty');
    }

    return new CloudflareToken(normalized);
  }

  equals(other: CloudflareToken): boolean {
    return this.value === other.value;
  }
}
