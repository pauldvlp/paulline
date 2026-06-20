import type { z } from 'zod';
import type {
  apiEnvSchema,
  loginSchema,
  machinePlaceholderSchema,
  tunnelPlaceholderSchema,
} from '@paulline/schemas';

export type { NodeEnvironment } from '@paulline/schemas';

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MachinePlaceholder = z.infer<typeof machinePlaceholderSchema>;
export type TunnelPlaceholder = z.infer<typeof tunnelPlaceholderSchema>;
