# Tasks — INFRA-003: SDK Improvements (const as const)

**Feature ID:** INFRA-003
**Status:** in_progress

- [x] **Task 1** — Añadir `as const` a `MACHINES_RESOURCE_PATH` y
  `TUNNELS_RESOURCE_PATH` en `packages/sdk/src/PaulineClient.ts` (líneas 5-6).
  - Cubre FR-1, FR-2.
- [x] **Task 2** — Verificar inferencia de tipos literales y compatibilidad con
  `ResourceClient` (parámetro `resourcePath: string` acepta literal). Sin cambios
  necesarios en `ResourceClient.ts`.
  - Cubre FR-2, NFR-1.
- [x] **Task 3** — Tests existentes pasan (`PaulineClient.test.ts`), sin cambios
  de runtime.
  - Cubre NFR-2.
- [x] **Task 4** — Verificación: `pnpm -r typecheck` y `lint` sin errores.
  - Cubre NFR-1.
