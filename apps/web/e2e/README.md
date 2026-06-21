# E2E Tests (Playwright)

End-to-end suites that exercise the running stack (API + web) the way a real
user/client would. Unit and component tests live with Vitest; this directory is
for cross-process, browser- and endpoint-level flows.

## Layout

| File | Purpose |
|---|---|
| `../playwright.config.ts` | Base config: browsers, timeouts, `baseURL`, retries, screenshots. |
| `setup.ts` | Preconditions — `waitForApiReady()` (health poll) and `resetTestState()` (no-op until AUTH-001). |
| `fixtures.ts` | Extended `test`/`expect` with `apiContext` and `authPage` fixtures. |
| `health.spec.ts` | Reference test: `GET /health` → `200 { status: "ok" }`. |

## Prerequisites

```bash
# From the repo root — install deps (Playwright comes with @paulline/web)
pnpm install

# Install the browser binaries once (chromium is enough for CI)
pnpm --filter @paulline/web exec playwright install --with-deps
```

The suites assume the stack is running. Boot it first:

```bash
docker compose up -d            # api on :3000, web on :5173
```

## Running

```bash
# All projects (chromium, firefox, webkit)
pnpm --filter @paulline/web test:e2e

# Single browser
pnpm --filter @paulline/web test:e2e --project=chromium

# A single file
pnpm --filter @paulline/web test:e2e e2e/health.spec.ts
```

## Debugging

```bash
# Step through in the Playwright Inspector
pnpm --filter @paulline/web test:e2e --debug

# Headed run to watch the browser
pnpm --filter @paulline/web test:e2e --headed

# Open the last HTML report (screenshots, traces, videos on failure)
pnpm --filter @paulline/web exec playwright show-report
```

On failure the config captures a screenshot, a video, and a trace (the trace
only on the first retry). They are attached to the HTML report.

## Writing a new test

1. Create `e2e/<feature>.spec.ts`.
2. Import the project fixtures, not the raw Playwright module:
   ```ts
   import { test, expect } from './fixtures';
   ```
3. For endpoint checks use the `apiContext` fixture; for UI flows use `page`
   (or `authPage` once AUTH-001 provides a session).
4. Add preconditions via `setup.ts` helpers in a `beforeAll`/`beforeEach`.
5. Keep tests deterministic: no fixed `waitForTimeout`, prefer web-first
   assertions and the readiness helpers.

## CI notes

- `headless` is on by default; set `CI=true` to enable retries, the `github`
  reporter, single worker, and `forbidOnly`.
- Browser binaries must be installed in the CI image
  (`playwright install --with-deps`).
