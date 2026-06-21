import { apiBaseURL } from '../playwright.config';

const HEALTH_PATH = '/health';
const READINESS_ATTEMPTS = 30;
const READINESS_INTERVAL_MS = 1_000;
const HTTP_OK = 200;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Blocks until the API answers a healthy status or the attempt budget is spent.
 * Used as a precondition so suites never run against a half-booted backend.
 */
export async function waitForApiReady(): Promise<void> {
  for (let attempt = 0; attempt < READINESS_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${apiBaseURL}${HEALTH_PATH}`);
      if (response.status === HTTP_OK) {
        return;
      }
    } catch {
      // The server is not accepting connections yet; retry after a short wait.
    }
    await sleep(READINESS_INTERVAL_MS);
  }

  throw new Error(`API not reachable at ${apiBaseURL}${HEALTH_PATH} after ${READINESS_ATTEMPTS} attempts`);
}

/**
 * Placeholder for per-suite state reset (database, seeded users, tokens).
 * Stays a no-op until AUTH-001 introduces stateful flows.
 */
export async function resetTestState(): Promise<void> {
  // Intentionally empty: no persistent state to reset in the scaffold.
}
