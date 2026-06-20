import { apiEnvSchema } from '@paulline/schemas';
import type { ApiEnv } from '@paulline/types';

const parsed = apiEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${message}`);
}

export const env: ApiEnv = parsed.data;
