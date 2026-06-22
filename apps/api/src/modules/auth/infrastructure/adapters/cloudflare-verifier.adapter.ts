import { Injectable } from '@nestjs/common';
import type {
  ICloudflareVerifier,
  VerifiedAccount,
} from '../../domain/ports/cloudflare-verifier.port';
import type { CloudflareToken } from '../../domain/value-objects/cloudflare-token';
import { InvalidApiTokenError } from '../../domain/errors/invalid-api-token.error';

export const CLOUDFLARE_VERIFY_URL =
  'https://api.cloudflare.com/client/v4/user/tokens/verify';

const ACTIVE_STATUS = 'active';
const VERIFY_TIMEOUT_MS = 2000;
const MIN_CALL_INTERVAL_MS = 1000;

type FetchFn = typeof fetch;

const defaultFetch: FetchFn = (input, init) => fetch(input, init);

type VerifyResponseBody = {
  success: boolean;
  result?: { id?: string; status?: string };
};

@Injectable()
export class CloudflareVerifierAdapter implements ICloudflareVerifier {
  private lastCallAt = 0;

  constructor(private readonly fetchFn: FetchFn = defaultFetch) {}

  async verify(token: CloudflareToken): Promise<VerifiedAccount> {
    await this.throttle();

    const body = await this.requestVerification(token.value);

    if (!body.success || body.result?.status !== ACTIVE_STATUS) {
      throw new InvalidApiTokenError();
    }

    return {
      tokenId: body.result?.id ?? '',
      status: body.result.status,
    };
  }

  private async requestVerification(tokenValue: string): Promise<VerifyResponseBody> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

    try {
      const response = await this.fetchFn(CLOUDFLARE_VERIFY_URL, {
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenValue}` },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new InvalidApiTokenError();
      }

      return (await response.json()) as VerifyResponseBody;
    } catch (error) {
      if (error instanceof InvalidApiTokenError) {
        throw error;
      }
      throw new InvalidApiTokenError();
    } finally {
      clearTimeout(timeout);
    }
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallAt;

    if (this.lastCallAt !== 0 && elapsed < MIN_CALL_INTERVAL_MS) {
      await delay(MIN_CALL_INTERVAL_MS - elapsed);
    }

    this.lastCallAt = Date.now();
  }
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
