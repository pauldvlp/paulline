# Design — INFRA-004: E2E Scaffold (Playwright Setup)

**Feature ID:** INFRA-004
**Status:** in_progress
**Depends on:** running stack (API `:3000`, web `:5173`)
**Blocker for:** AUTH-001

## Objetivo

Instalar y configurar Playwright en `apps/web` con una estructura escalable para
tests E2E, un test de referencia (health check) y documentación, sin romper el
runner de tests existente (Vitest) ni los gates del repo.

## Decisiones de diseño

### 1. Ubicación: `apps/web` (no paquete dedicado)

Playwright se instala como `devDependency` de `@paulline/web`. Es el app que
expone la UI y es el punto de entrada natural para flujos E2E (login, dashboard).
Evita un paquete extra y mantiene el scaffold cerca de lo que prueba. El config
vive en `apps/web/playwright.config.ts` y los specs en `apps/web/e2e/`.

### 2. Coexistencia con Vitest

Vitest y Playwright comparten la palabra `test` pero con APIs incompatibles.
Para que no colisionen:

- Vitest excluye `e2e/**` (`test.exclude` en `vite.config.ts`).
- `tsconfig.json` solo incluye `src` y `vite.config.ts`, así que `pnpm lint`
  (`tsc --noEmit`) no type-checkea `e2e/`; Playwright compila sus propios specs.
- Los specs E2E importan `test`/`expect` desde `./fixtures`, nunca desde los
  globals de Vitest.

### 3. Browsers y CI-readiness

Tres proyectos: `chromium`, `firefox`, `webkit`. `headless: true` por defecto.
Bajo `CI=true`: `retries=2`, `workers=1`, `forbidOnly`, reporter `github`. En
local: `retries=0`, reporter `list`. Capturas en fallo: `screenshot`,
`video`, `trace` (trace solo en el primer retry).

### 4. Estructura escalable

| Archivo | Rol | Estado |
|---|---|---|
| `playwright.config.ts` | Config base + exporta `baseURL`/`apiBaseURL` | activo |
| `e2e/setup.ts` | `waitForApiReady()` (poll health), `resetTestState()` | health activo; reset no-op |
| `e2e/fixtures.ts` | `test`/`expect` extendidos: `apiContext`, `authPage` | `apiContext` activo; `authPage` stub para AUTH-001 |
| `e2e/health.spec.ts` | Test de referencia: `GET /health → 200` | activo |
| `e2e/README.md` | Guía de uso | activo |

### 5. Sin magic values

Puertos, timeouts, reintentos, paths y status codes se declaran como constantes
nombradas en cada archivo. `baseURL`/`apiBaseURL` se derivan de `WEB_PORT`/
`API_PORT` (env) y se reexportan desde el config para que setup/fixtures no
redupliquen URLs.

## Mapeo a requisitos

| FR/NFR | Implementación |
|---|---|
| FR-1 | `@playwright/test` en `apps/web/package.json`; `playwright.config.ts` presente |
| FR-2 | `health.spec.ts` vía `apiContext.get('/health')` |
| FR-3 | `fixtures.ts`, `setup.ts`, `README.md` en `e2e/` |
| FR-4 | `headless`, `screenshot:'only-on-failure'`, reporter HTML/github, retries CI |
| NFR-1 | Test de health < 1s; sin waits fijos (poll con presupuesto) |
| NFR-2 | `e2e/README.md` + sección en README raíz |
| NFR-3 | `waitForApiReady` evita flakiness; `retries` configurados |

## Fuera de alcance

- Flujos de login E2E reales (AUTH-001).
- Workflow de GitHub Actions (config ya es CI-ready; el YAML se añade aparte).
- Instalación de binarios de navegador en CI (documentado, no automatizado aquí).
