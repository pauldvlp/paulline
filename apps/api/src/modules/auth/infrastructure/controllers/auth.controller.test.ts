import { describe, it, expect, vi } from 'vitest';
import { AuthController } from './auth.controller';
import type { AuthService } from '../../application/services/auth.service';
import { InvalidApiTokenError } from '../../domain/errors/invalid-api-token.error';

describe('AuthController', () => {
  it('login returns the issued session on success', async () => {
    const service = {
      login: vi.fn().mockResolvedValue({
        sessionToken: 'jwt.session.token',
        expiresAt: '2026-06-23T00:00:00.000Z',
      }),
    } as unknown as AuthService;

    const controller = new AuthController(service);
    const result = await controller.login({ apiToken: 'cf-token' });

    expect(service.login).toHaveBeenCalledWith({ apiToken: 'cf-token' });
    expect(result).toEqual({
      sessionToken: 'jwt.session.token',
      expiresAt: '2026-06-23T00:00:00.000Z',
    });
  });

  it('login propagates InvalidApiTokenError from the service', async () => {
    const service = {
      login: vi.fn().mockRejectedValue(new InvalidApiTokenError()),
    } as unknown as AuthService;

    const controller = new AuthController(service);
    await expect(controller.login({ apiToken: 'bad' })).rejects.toBeInstanceOf(
      InvalidApiTokenError,
    );
  });

  it('logout delegates to the service and returns nothing', async () => {
    const service = {
      logout: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuthService;

    const controller = new AuthController(service);
    await controller.logout();

    expect(service.logout).toHaveBeenCalledOnce();
  });
});
