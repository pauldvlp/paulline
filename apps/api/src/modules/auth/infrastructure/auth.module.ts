import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from '../application/services/auth.service';
import { SessionGuard } from './guards/session.guard';
import { CloudflareVerifierAdapter } from './adapters/cloudflare-verifier.adapter';
import { AesTokenCipherAdapter } from './adapters/aes-token-cipher.adapter';
import { PrismaCredentialRepository } from './adapters/prisma-credential.repository';
import { JwtSessionIssuerAdapter } from './adapters/jwt-session-issuer.adapter';
import { CLOUDFLARE_VERIFIER } from '../domain/ports/cloudflare-verifier.port';
import { CREDENTIAL_REPOSITORY } from '../domain/ports/credential-repository.port';
import { TOKEN_CIPHER } from '../domain/ports/token-cipher.port';
import { SESSION_ISSUER } from '../domain/ports/session-issuer.port';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionGuard,
    { provide: CLOUDFLARE_VERIFIER, useFactory: () => new CloudflareVerifierAdapter() },
    { provide: TOKEN_CIPHER, useClass: AesTokenCipherAdapter },
    { provide: CREDENTIAL_REPOSITORY, useFactory: () => new PrismaCredentialRepository() },
    { provide: SESSION_ISSUER, useClass: JwtSessionIssuerAdapter },
  ],
  exports: [AuthService, SessionGuard, SESSION_ISSUER],
})
export class AuthModule {}
