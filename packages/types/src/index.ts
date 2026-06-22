import type { z } from 'zod';
import type {
  apiEnvSchema,
  loginSchema,
  authSessionSchema,
  machinePlaceholderSchema,
  tunnelPlaceholderSchema,
} from '@paulline/schemas';

export type { NodeEnvironment } from '@paulline/schemas';

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type MachinePlaceholder = z.infer<typeof machinePlaceholderSchema>;
export type TunnelPlaceholder = z.infer<typeof tunnelPlaceholderSchema>;
