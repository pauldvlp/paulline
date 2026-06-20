# Requirements — INFRA-001: Arquitectura Hexagonal en módulo Health

**Feature ID:** INFRA-001  
**Status:** spec_ready  
**Severity:** Importante  
**Blocker for:** Alineación arquitectónica consistente  

## Descripción

El módulo `health/` está ubicado en `apps/api/src/health/` (fuera de `modules/`) y no sigue la arquitectura Hexagonal definida en convenciones. Debe moverse a `modules/health/` y aplicar la estructura de capas (domain → application → infrastructure).

## Requisitos Funcionales (EARS)

**FR-1: Estructura Hexagonal aplicada**
- GIVEN un módulo `modules/health/` 
- WHEN se inspecciona la estructura de directorios 
- THEN existen las capas: `domain/`, `application/`, `infrastructure/` con responsabilidades separadas

**FR-2: Health check via GET /health**
- GIVEN una aplicación NestJS arrancada 
- WHEN se ejecuta GET http://localhost:3000/health 
- THEN responde 200 con JSON { status: 'ok', timestamp: ISO8601 }

**FR-3: Módulo registrado en AppModule**
- GIVEN el módulo health redefinido 
- WHEN AppModule importa HealthModule 
- THEN no hay errores de inyección de dependencias; health check funciona

## Requisitos No Funcionales (EARS)

**NFR-1: Consistencia con otros módulos**
- Hexagonal pattern aplicado igual que en auth/machines/tunnels/monitoring

**NFR-2: Tests pasan**
- health.service.test.ts y health.controller.test.ts verdes; cobertura > 80%

**NFR-3: Documentación**
- Comentario en `modules/health/` explicando que es módulo de infraestructura (stateless)

## Criterios de Aceptación

- [ ] Directorio `apps/api/src/modules/health/` existe con estructura: domain/, application/, infrastructure/
- [ ] `domain/health-status.ts` define value object / tipos de dominio
- [ ] `application/health.service.ts` implementa lógica de check (sin dependencias externas)
- [ ] `infrastructure/health.controller.ts` expone GET /health
- [ ] `infrastructure/health.module.ts` declara HealthModule (NestJS)
- [ ] No existen archivos en `apps/api/src/health/` (ya movidos)
- [ ] Tests (service + controller) verdes
- [ ] `pnpm -r lint` y `pnpm -r typecheck` pasan sin errores
- [ ] No hay cambios en otros módulos (aislado)

## Trazabilidad

| FR/NFR | Test | Verificación |
|--------|------|--------------|
| FR-1 | (estructura) | Inspección visual + test import |
| FR-2 | health.controller.test.ts | GET /health → 200 + JSON |
| FR-3 | app.module.spec.ts | AppModule bootsrap sin errores |
| NFR-1 | (patrón) | Revisión de código (hexagonal layers) |
| NFR-2 | vitest run | Cobertura > 80% |
| NFR-3 | (doc) | Comentario en module file |
