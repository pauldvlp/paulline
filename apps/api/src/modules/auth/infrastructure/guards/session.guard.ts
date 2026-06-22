import {
  CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SESSION_ISSUER, type ISessionIssuer } from '../../domain/ports/session-issuer.port';

const BEARER_PREFIX = 'Bearer ';
const UNAUTHORIZED_CODE = 'UNAUTHORIZED';
const UNAUTHORIZED_MESSAGE = 'A valid session is required';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(SESSION_ISSUER) private readonly issuer: ISessionIssuer) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const header = request.headers.authorization;

    if (!header || !header.startsWith(BEARER_PREFIX)) {
      throw this.unauthorized();
    }

    const sessionToken = header.slice(BEARER_PREFIX.length);

    try {
      await this.issuer.verify(sessionToken);
    } catch {
      throw this.unauthorized();
    }

    return true;
  }

  private unauthorized(): UnauthorizedException {
    return new UnauthorizedException({
      error: { code: UNAUTHORIZED_CODE, message: UNAUTHORIZED_MESSAGE },
    });
  }
}
