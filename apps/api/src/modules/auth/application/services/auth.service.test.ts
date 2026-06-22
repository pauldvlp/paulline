import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import type { ICloudflareVerifier } from '../../domain/ports/cloudflare-verifier.port';
import type { ICredentialRepository } from '../../domain/ports/credential-repository.port';
import type { ITokenCipher } from '../../domain/ports/token-cipher.port';
import type { ISessionIssuer } from '../../domain/ports/session-issuer.port';
import { InvalidApiTokenError } from '../../domain/errors/invalid-api-token.error';
import { CredentialNotFoundError } from '../../domain/errors/credential-not-found.error';

const buildEntity = (encryptedToken: string) => ({
  id: 'cred-1',
  encryptedToken,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('AuthService', () => {
  let verifier: ICloudflareVerifier;
  let repository: ICredentialRepository;
  let cipher: ITokenCipher;
  let issuer: ISessionIssuer;
  let service: AuthService;

  beforeEach(() => {
    verifier = { verify: vi.fn().mockResolvedValue({ tokenId: 't-1', status: 'active' }) };
    repository = {
      saveActive: vi.fn().mockResolvedValue(buildEntity('iv:tag:cipher')),
      findActive: vi.fn(),
      clear: vi.fn().mockResolvedValue(undefined),
    };
    cipher = {
      encrypt: vi.fn().mockReturnValue('iv:tag:cipher'),
      decrypt: vi.fn().mockReturnValue('cf-plain-token'),
    };
    issuer = {
      issue: vi.fn().mockResolvedValue({
        sessionToken: 'jwt.session.token',
        expiresAt: '2026-06-23T00:00:00.000Z',
      }),
      verify: vi.fn(),
    };
    service = new AuthService(verifier, repository, cipher, issuer);
  });

  it('login verifies, encrypts, saves once, and returns a session', async () => {
    const session = await service.login({ apiToken: '  cf-plain-token  ' });

    expect(verifier.verify).toHaveBeenCalledOnce();
    expect(cipher.encrypt).toHaveBeenCalledWith('cf-plain-token');
    expect(repository.saveActive).toHaveBeenCalledOnce();
    expect(repository.saveActive).toHaveBeenCalledWith({ encryptedToken: 'iv:tag:cipher' });
    expect(issuer.issue).toHaveBeenCalledWith('cred-1');
    expect(session).toEqual({
      sessionToken: 'jwt.session.token',
      expiresAt: '2026-06-23T00:00:00.000Z',
    });
  });

  it('login propagates InvalidApiTokenError and does not persist when verification fails', async () => {
    verifier.verify = vi.fn().mockRejectedValue(new InvalidApiTokenError());

    await expect(service.login({ apiToken: 'bad-token' })).rejects.toBeInstanceOf(
      InvalidApiTokenError,
    );
    expect(repository.saveActive).not.toHaveBeenCalled();
    expect(issuer.issue).not.toHaveBeenCalled();
  });

  it('logout clears the stored credential', async () => {
    await service.logout();
    expect(repository.clear).toHaveBeenCalledOnce();
  });

  it('getActiveToken decrypts the stored credential', async () => {
    repository.findActive = vi.fn().mockResolvedValue(buildEntity('iv:tag:cipher'));

    const token = await service.getActiveToken();

    expect(cipher.decrypt).toHaveBeenCalledWith('iv:tag:cipher');
    expect(token).toBe('cf-plain-token');
  });

  it('getActiveToken throws CredentialNotFoundError when none stored', async () => {
    repository.findActive = vi.fn().mockResolvedValue(null);

    await expect(service.getActiveToken()).rejects.toBeInstanceOf(CredentialNotFoundError);
  });
});
