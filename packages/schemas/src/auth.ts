import { z } from 'zod';

export const loginSchema = z.object({
  apiToken: z.string().trim().min(1, 'Cloudflare API token is required'),
});

export const authSessionSchema = z.object({
  sessionToken: z.string().min(1),
  expiresAt: z.string(),
});
