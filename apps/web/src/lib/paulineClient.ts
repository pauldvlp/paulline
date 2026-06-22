import { PaulineClient } from '@paulline/sdk';

const DEFAULT_API_URL = 'http://localhost:3000';

const baseUrl = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export const paulineClient = new PaulineClient({ baseUrl });
