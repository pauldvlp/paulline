export const INVALID_API_TOKEN_CODE = 'INVALID_API_TOKEN';

export class InvalidApiTokenError extends Error {
  readonly code = INVALID_API_TOKEN_CODE;

  constructor(message = 'Invalid API key. Check credentials at https://dash.cloudflare.com') {
    super(message);
    this.name = 'InvalidApiTokenError';
  }
}
