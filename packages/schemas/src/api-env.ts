import { z } from 'zod';
import { NODE_ENVIRONMENTS } from './node-environments';

const DEFAULT_API_PORT = 3000;

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(NODE_ENVIRONMENTS).default('development'),
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(DEFAULT_API_PORT),
});
