# Design — INFRA-001: Arquitectura Hexagonal en módulo Health

## Decisión

Reubicar `health/` a `modules/health/` aplicando capas Hexagonal. Es el primer módulo
con estructura completa, por lo que sirve de patrón de referencia para auth/machines/tunnels/monitoring.

## Estructura de capas

```
modules/health/
  domain/health-status.ts          # Tipos de dominio (HealthStatus, HEALTH_STATUS_OK)
  application/health.service.ts     # Lógica de check, depende solo de domain
  application/health.service.test.ts
  infrastructure/health.controller.ts   # Adaptador HTTP (GET /health)
  infrastructure/health.module.ts       # Wiring NestJS
  infrastructure/health.controller.test.ts
```

### Reglas de dependencia
- `domain` no importa nada externo (tipos puros).
- `application` importa `domain`.
- `infrastructure` importa `application` + `domain`.

## Decisiones puntuales

- **Sin puerto/interface explícito:** health es stateless y no consume infraestructura
  externa (DB, red). Definir un puerto sería sobreingeniería. La lógica vive en
  `application`; cuando aparezca una dependencia externa real, se introducirá un puerto
  en `domain` y su adaptador en `infrastructure`.
- **`@Injectable` en el service:** se mantiene para que NestJS lo resuelva por DI en runtime.
- **Test del controller sin `Test.createTestingModule`:** Vitest usa esbuild y no emite
  `emitDecoratorMetadata`, por lo que el contenedor DI de Nest no resuelve los parámetros
  del constructor en tests. Se instancia el controller con su dependencia inyectada
  manualmente (`new HealthController(new HealthService())`), validando la integración
  controller↔service sin acoplarse a la reflexión de metadatos. Evita tocar el toolchain.
- **No magic strings:** el literal de estado vive en la constante `HEALTH_STATUS_OK`.

## Trazabilidad
- FR-1 → estructura de directorios por capas.
- FR-2 → `health.controller.ts` + tests devuelven `{ status: 'ok', timestamp }`.
- FR-3 → `app.module.ts` importa el nuevo `HealthModule`; tsc compila sin errores DI.
