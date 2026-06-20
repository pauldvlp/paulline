# Tasks — INFRA-001: Arquitectura Hexagonal en módulo Health

> Estado por tarea: [ ] pendiente · [x] hecha

- [x] **Task 1 — Estructura de directorios**
  Crear `apps/api/src/modules/health/{domain,application,infrastructure}/`.

- [x] **Task 2 — Migrar dominio**
  Mover tipos a `domain/health-status.ts` (`HealthStatus`, `HEALTH_STATUS_OK`). Sin imports externos.

- [x] **Task 3 — Capa application**
  `application/health.service.ts`: `HealthService.check()` devuelve `HealthStatus`. Importa solo `domain`.

- [x] **Task 4 — Controller (infra)**
  `infrastructure/health.controller.ts`: `@Controller('health')` + `@Get()`, delega en `HealthService`.

- [x] **Task 5 — Module (infra)**
  `infrastructure/health.module.ts`: `@Module` que registra controller + provider. Comentario "módulo de infraestructura stateless".

- [x] **Task 6 — Eliminar módulo viejo**
  Borrar `apps/api/src/health/` completo.

- [x] **Task 7 — Update AppModule**
  Importar `HealthModule` desde `./modules/health/infrastructure/health.module`.

- [x] **Task 8 — Tests (TDD)**
  `application/health.service.test.ts` (unit) + `infrastructure/health.controller.test.ts` (integración controller↔service).

- [x] **Task 9 — Verificación**
  `pnpm test` (3 verdes), `pnpm lint` (tsc --noEmit OK), AppModule compila.
