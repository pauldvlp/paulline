import { z } from 'zod';
import { NODE_ENVIRONMENTS } from './node-environments';

const DEFAULT_API_PORT = 3000;
const ENCRYPTION_KEY_BYTE_LENGTH = 32;
const JWT_SECRET_MIN_LENGTH = 32;
const DEFAULT_SESSION_TTL_SECONDS = 86400;

const decodesToExactBytes = (value: string, byteLength: number): boolean => {
  try {
    return Buffer.from(value, 'base64').length === byteLength;
  } catch {
    return false;
  }
};

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(NODE_ENVIRONMENTS).default('development'),
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(DEFAULT_API_PORT),
  AUTH_ENCRYPTION_KEY: z
    .string()
    .refine((value) => decodesToExactBytes(value, ENCRYPTION_KEY_BYTE_LENGTH), {
      message: `AUTH_ENCRYPTION_KEY must be base64 decoding to ${ENCRYPTION_KEY_BYTE_LENGTH} bytes`,
    }),
  AUTH_JWT_SECRET: z.string().min(JWT_SECRET_MIN_LENGTH),
  AUTH_SESSION_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_SESSION_TTL_SECONDS),
});
