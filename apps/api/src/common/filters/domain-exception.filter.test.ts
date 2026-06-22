import { describe, it, expect, vi } from 'vitest';
import { HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { InvalidApiTokenError } from '../../modules/auth/domain/errors/invalid-api-token.error';
import { CredentialNotFoundError } from '../../modules/auth/domain/errors/credential-not-found.error';

const buildHost = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
};

describe('DomainExceptionFilter', () => {
  it('maps InvalidApiTokenError to 401 with the canonical error shape', () => {
    const { host, status, json } = buildHost();
    new DomainExceptionFilter().catch(new InvalidApiTokenError(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_API_TOKEN',
        message: 'Invalid API key. Check credentials at https://dash.cloudflare.com',
      },
    });
  });

  it('maps CredentialNotFoundError to 401', () => {
    const { host, status, json } = buildHost();
    new DomainExceptionFilter().catch(new CredentialNotFoundError(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'CREDENTIAL_NOT_FOUND', message: 'No active credential found' },
    });
  });

  it('passes through an HttpException carrying the canonical error shape', () => {
    const { host, status, json } = buildHost();
    const exception = new HttpException(
      { error: { code: 'UNAUTHORIZED', message: 'A valid session is required' } },
      HttpStatus.UNAUTHORIZED,
    );
    new DomainExceptionFilter().catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'A valid session is required' },
    });
  });

  it('maps an unknown error to a 500 without leaking its message', () => {
    const { host, status, json } = buildHost();
    new DomainExceptionFilter().catch(new Error('secret-token-leaked-here'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const payload = json.mock.calls[0][0];
    expect(JSON.stringify(payload)).not.toContain('secret-token-leaked-here');
    expect(payload.error.code).toBe('INTERNAL_ERROR');
  });
});
