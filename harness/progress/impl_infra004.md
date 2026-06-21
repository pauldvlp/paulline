# Impl Log — INFRA-004: E2E Scaffold (Playwright)

**Rol:** implementer · **Flujo:** TDD (red → green → refactor)
**Estado final:** in_review (pendiente reviewer + puerta de commit)

## Resumen

Scaffold de Playwright en `apps/web` con estructura escalable, test de
referencia (health check) y documentación. No rompe Vitest ni lint.

## Archivos creados

| Archivo | Qué es |
|---|---|
| `harness/specs/INFRA-004-e2e-scaffold/design.md` | Decisiones de diseño + mapeo a FR/NFR |
| `harness/specs/INFRA-004-e2e-scaffold/tasks.md` | 12 subtareas con trazabilidad |
| `apps/web/playwright.config.ts` | Config base: 3 browsers, timeout 30s, baseURL :5173, capturas, retries CI |
| `apps/web/e2e/setup.ts` | `waitForApiReady()` (poll health), `resetTestState()` (no-op) |
| `apps/web/e2e/fixtures.ts` | `test`/`expect` extendidos: `apiContext`, `authPage` (stub AUTH-001) |
| `apps/web/e2e/health.spec.ts` | Test: `GET /health → 200 { status: "ok" }` |
| `apps/web/e2e/README.md` | Guía: instalar, correr, debuggear, escribir |

## Archivos modificados

- `apps/web/package.json` — `@playwright/test` devDep + script `test:e2e`
- `package.json` (raíz) — script `test:e2e`
- `apps/web/vite.config.ts` — Vitest excluye `e2e/**` (evita colisión con Playwright)
- `.gitignore` — artefactos de Playwright (test-results, playwright-report, etc.)
- `README.md` — sección E2E + stack actualizado

## Decisiones clave

1. **Ubicación en `apps/web`**, no paquete dedicado (cercanía a la UI que prueba).
2. **Coexistencia Vitest/Playwright**: Vitest excluye `e2e/**`; tsconfig de web
   solo incluye `src` + `vite.config.ts` (lint no toca `e2e/`); los specs
   importan `test`/`expect` desde `./fixtures`.
3. **CI-ready**: `headless`, `screenshot/video/trace` on failure, reporter
   `github`+`html` y `retries=2`/`workers=1` bajo `CI=true`.
4. **Sin magic values**: puertos, timeouts, paths y status codes como constantes;
   `baseURL`/`apiBaseURL` derivados de env y reexportados desde el config.

## Verificaciones

- **E2E (3 browsers):** `pnpm test:e2e` → 3 passed (chromium, firefox, webkit),
  cada uno ~0.3s. ✅
- **Unit tests (no rompe existentes):** `pnpm test` → sdk 5, api 3, web 4 = todos
  verdes. ✅
- **Lint:** `pnpm --filter @paulline/web lint` (`tsc --noEmit`) exit 0. ✅
- **Playwright version:** 1.61.0. ✅

## Notas / bloqueos

- La API local (`start:dev`) requiere cargar `.env` manualmente (`set -a; . ./.env`)
  porque el proceso no auto-carga el `.env` raíz. No es parte de esta feature;
  en Docker (`docker compose up`) el env se inyecta correctamente. El `e2e/README.md`
  asume el stack arriba vía `docker compose up -d`.
- Binarios de navegador (chromium/firefox/webkit) instalados localmente; en CI
  hay que correr `playwright install --with-deps` (documentado).
- Sin commits (lo hace la puerta de commit tras review + OK humano).
