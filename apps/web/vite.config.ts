/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEV_HOST = '0.0.0.0';
const DEFAULT_WEB_PORT = 5173;
const DEFAULT_API_URL = 'http://localhost:3000';
const API_PROXY_PREFIX = '/api';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const webPort = Number(env.WEB_PORT ?? DEFAULT_WEB_PORT);
  const apiUrl = env.VITE_API_URL ?? DEFAULT_API_URL;

  return {
    plugins: [react()],
    resolve: {
      conditions: ['development'],
    },
    server: {
      host: DEV_HOST,
      port: webPort,
      proxy: {
        [API_PROXY_PREFIX]: {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    },
  };
});
