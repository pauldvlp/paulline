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
}
