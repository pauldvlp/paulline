import { Injectable } from '@nestjs/common';
import { SignJWT, jwtVerify } from 'jose';
import type {
  ISessionIssuer,
  IssuedSession,
  VerifiedSession,
} from '../../domain/ports/session-issuer.port';
import { ConfigService } from '../../../../config/config.service';

const ALGORITHM = 'HS256';
const MILLISECONDS_PER_SECOND = 1000;

@Injectable()
export class JwtSessionIssuerAdapter implements ISessionIssuer {
  private readonly secret: Uint8Array;
  private readonly ttlSeconds: number;

  constructor(private readonly config: ConfigService) {
    this.secret = new TextEncoder().encode(this.config.authJwtSecret);
    this.ttlSeconds = this.config.authSessionTtlSeconds;
  }

  async issue(subjectId: string): Promise<IssuedSession> {
    const issuedAtSeconds = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
    const expiresAtSeconds = issuedAtSeconds + this.ttlSeconds;

    const sessionToken = await new SignJWT({})
      .setProtectedHeader({ alg: ALGORITHM })
      .setSubject(subjectId)
      .setIssuedAt(issuedAtSeconds)
      .setExpirationTime(expiresAtSeconds)
      .sign(this.secret);

    return {
      sessionToken,
      expiresAt: new Date(expiresAtSeconds * MILLISECONDS_PER_SECOND).toISOString(),
    };
  }

  async verify(sessionToken: string): Promise<VerifiedSession> {
    const { payload } = await jwtVerify(sessionToken, this.secret, {
      algorithms: [ALGORITHM],
    });

    if (!payload.sub) {
      throw new Error('Session token is missing a subject');
    }

    return { subjectId: payload.sub };
  }
}
