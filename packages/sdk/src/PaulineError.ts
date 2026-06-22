const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR';
const UNKNOWN_ERROR_MESSAGE = 'An unexpected error occurred';

export class PaulineError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'PaulineError';
    this.code = code;
    this.status = status;
  }

  static fromResponse(status: number, body: unknown): PaulineError {
    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof (body as { error?: { code?: unknown; message?: unknown } }).error?.code === 'string'
    ) {
      const { code, message } = (body as { error: { code: string; message: string } }).error;
      return new PaulineError(code, message, status);
    }

    return new PaulineError(UNKNOWN_ERROR_CODE, UNKNOWN_ERROR_MESSAGE, status);
  }
}
