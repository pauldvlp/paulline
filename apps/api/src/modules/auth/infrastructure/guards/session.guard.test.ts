import { describe, it, expect, vi } from 'vitest';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { SessionGuard } from './session.guard';
import type { ISessionIssuer } from '../../domain/ports/session-issuer.port';

const buildContext = (authHeader?: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers: authHeader ? { authorization: authHeader } : {} }),
    }),
  }) as unknown as ExecutionContext;

describe('SessionGuard', () => {
  it('allows the request when the bearer token is valid', async () => {
    const issuer = {
      verify: vi.fn().mockResolvedValue({ subjectId: 'cred-1' }),
    } as unknown as ISessionIssuer;

    const guard = new SessionGuard(issuer);
    const allowed = await guard.canActivate(buildContext('Bearer valid.jwt.token'));

    expect(allowed).toBe(true);
    expect(issuer.verify).toHaveBeenCalledWith('valid.jwt.token');
  });

  it('throws UnauthorizedException when no authorization header is present', async () => {
    const issuer = { verify: vi.fn() } as unknown as ISessionIssuer;
    const guard = new SessionGuard(issuer);

    await expect(guard.canActivate(buildContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(issuer.verify).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when the token fails verification', async () => {
    const issuer = {
      verify: vi.fn().mockRejectedValue(new Error('expired')),
    } as unknown as ISessionIssuer;

    const guard = new SessionGuard(issuer);
    await expect(guard.canActivate(buildContext('Bearer bad.token'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
