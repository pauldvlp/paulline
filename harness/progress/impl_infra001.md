# Impl Log — INFRA-001 (Hexagonal Health)

Rol: implementer · Estado: in_review

## Hecho
- Estructura Hexagonal creada en `apps/api/src/modules/health/{domain,application,infrastructure}/`.
- Migrados: tipos → domain, service → application, controller+module → infrastructure.
- Eliminado módulo viejo `apps/api/src/health/`.
- `app.module.ts` ahora importa `HealthModule` desde `modules/health/infrastructure/health.module`.
- Tests: service (unit) + controller (integración) escritos primero (red→green).
- Comentario "módulo de infraestructura stateless" en `health.module.ts` (NFR-3).

## Verificación
- `pnpm test`: 3/3 verdes (2 service, 1 controller).
- `pnpm lint` (tsc --noEmit): OK, sin errores.
- No existe script `typecheck` en api; `lint` ya ejecuta `tsc --noEmit` (cumple typecheck).

## Notas / decisiones
- Sin puerto/interface: health es stateless, no consume infra externa. Sobreingeniería evitarlo.
- Test del controller instancia manualmente la dependencia: Vitest (esbuild) no emite
  `emitDecoratorMetadata`, así que `Test.createTestingModule` no resuelve el constructor.
  Se valida la integración controller↔service sin tocar el toolchain.

## Pendiente para reviewer / humano
- Confirmar que no introducir vitest config con metadatos de decoradores es aceptable
  (alternativa: configurar swc/reflect-metadata en vitest para tests DI completos de Nest).
