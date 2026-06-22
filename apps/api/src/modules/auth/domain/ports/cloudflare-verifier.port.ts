import type { CloudflareToken } from '../value-objects/cloudflare-token';

export type VerifiedAccount = {
  tokenId: string;
  status: string;
};

export interface ICloudflareVerifier {
  verify(token: CloudflareToken): Promise<VerifiedAccount>;
}

export const CLOUDFLARE_VERIFIER = Symbol('ICloudflareVerifier');
