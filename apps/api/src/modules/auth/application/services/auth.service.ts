import { Inject, Injectable } from '@nestjs/common';
import {
  CLOUDFLARE_VERIFIER,
  type ICloudflareVerifier,
} from '../../domain/ports/cloudflare-verifier.port';
import {
  CREDENTIAL_REPOSITORY,
  type ICredentialRepository,
} from '../../domain/ports/credential-repository.port';
import { TOKEN_CIPHER, type ITokenCipher } from '../../domain/ports/token-cipher.port';
import { SESSION_ISSUER, type ISessionIssuer } from '../../domain/ports/session-issuer.port';
import { CloudflareToken } from '../../domain/value-objects/cloudflare-token';
import { CredentialNotFoundError } from '../../domain/errors/credential-not-found.error';
import type { LoginDto } from '../dtos/login.dto';
import type { AuthSessionDto } from '../dtos/auth-session.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CLOUDFLARE_VERIFIER) private readonly verifier: ICloudflareVerifier,
    @Inject(CREDENTIAL_REPOSITORY) private readonly repository: ICredentialRepository,
    @Inject(TOKEN_CIPHER) private readonly cipher: ITokenCipher,
    @Inject(SESSION_ISSUER) private readonly issuer: ISessionIssuer,
  ) {}

  async login(dto: LoginDto): Promise<AuthSessionDto> {
    const token = CloudflareToken.create(dto.apiToken);

    await this.verifier.verify(token);

    const encryptedToken = this.cipher.encrypt(token.value);
    const credential = await this.repository.saveActive({ encryptedToken });

    return this.issuer.issue(credential.id);
  }

  async logout(): Promise<void> {
    await this.repository.clear();
  }

  async getActiveToken(): Promise<string> {
    const credential = await this.repository.findActive();

    if (!credential) {
      throw new CredentialNotFoundError();
    }

    return this.cipher.decrypt(credential.encryptedToken);
  }
}
