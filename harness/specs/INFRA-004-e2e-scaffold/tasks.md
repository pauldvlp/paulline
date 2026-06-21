# Tasks — INFRA-004: E2E Scaffold (Playwright Setup)

**Feature ID:** INFRA-004
**Flujo:** TDD (red → green → refactor). El "test" raíz de esta feature es el
propio `health.spec.ts` corriendo verde contra la API.

| # | Tarea | Archivo / Comando | Done when |
|---|---|---|---|
| 1 | Instalar `@playwright/test` como devDependency de web | `pnpm --filter @paulline/web add -D @playwright/test` | aparece en `apps/web/package.json`; `playwright --version` funciona |
| 2 | Instalar binario de navegador (chromium) para correr local | `pnpm --filter @paulline/web exec playwright install --with-deps` | chromium descargado |
| 3 | Crear `playwright.config.ts` base (testDir, timeout, baseURL, headless) | `apps/web/playwright.config.ts` | config válido; `playwright test --list` no falla |
| 4 | Añadir proyectos chromium/firefox/webkit + capturas y retries CI | `apps/web/playwright.config.ts` | 3 proyectos; screenshot/video/trace on failure; retries bajo `CI` |
| 5 | Crear `setup.ts` con `waitForApiReady()` y `resetTestState()` stub | `apps/web/e2e/setup.ts` | helpers exportados; sin magic values |
| 6 | Crear `fixtures.ts` con `test`/`expect` extendidos (`apiContext`, `authPage`) | `apps/web/e2e/fixtures.ts` | fixtures tipados; `authPage` documentado como stub para AUTH-001 |
| 7 | Crear `health.spec.ts` (`GET /health → 200 { status: "ok" }`) | `apps/web/e2e/health.spec.ts` | test definido usando `apiContext` |
| 8 | Crear `e2e/README.md` (instalar, correr, debuggear, escribir) | `apps/web/e2e/README.md` | instrucciones completas |
| 9 | Documentar E2E en README raíz + stack | `README.md` | sección E2E presente |
| 10 | Añadir scripts `test:e2e` (web + raíz) | `apps/web/package.json`, `package.json` | `pnpm test:e2e` resoluble |
| 11 | Evitar colisión con Vitest (excluir `e2e/**`) + gitignore artefactos | `apps/web/vite.config.ts`, `.gitignore` | Vitest no recoge `e2e/`; reportes ignorados |
| 12 | Verificación: E2E verde, unit tests verdes, lint OK | `pnpm test:e2e`, `pnpm test`, `pnpm lint` | health pasa; suites existentes pasan; lint exit 0 |

## Trazabilidad tareas → requisitos

- Tareas 1–4 → FR-1, FR-4, NFR-3
- Tareas 5–7 → FR-2, FR-3, NFR-1
- Tareas 8–9 → NFR-2
- Tareas 10–11 → coexistencia / higiene de repo
- Tarea 12 → criterios de aceptación (gates de verificación)
