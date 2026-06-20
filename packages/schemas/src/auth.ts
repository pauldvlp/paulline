import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
});
