import { Injectable } from '@nestjs/common';
import type { ApiEnv, NodeEnvironment } from '@paulline/types';
import { env } from './env';

@Injectable()
export class ConfigService {
  private readonly values: ApiEnv = env;

  get nodeEnv(): NodeEnvironment {
    return this.values.NODE_ENV;
  }

  get databaseUrl(): string {
    return this.values.DATABASE_URL;
  }

  get apiPort(): number {
    return this.values.API_PORT;
  }

  get authEncryptionKey(): string {
    return this.values.AUTH_ENCRYPTION_KEY;
  }

  get authJwtSecret(): string {
    return this.values.AUTH_JWT_SECRET;
  }

  get authSessionTtlSeconds(): number {
    return this.values.AUTH_SESSION_TTL_SECONDS;
  }
}
