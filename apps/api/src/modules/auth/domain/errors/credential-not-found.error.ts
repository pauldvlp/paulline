export const CREDENTIAL_NOT_FOUND_CODE = 'CREDENTIAL_NOT_FOUND';

export class CredentialNotFoundError extends Error {
  readonly code = CREDENTIAL_NOT_FOUND_CODE;

  constructor(message = 'No active credential found') {
    super(message);
    this.name = 'CredentialNotFoundError';
  }
}
