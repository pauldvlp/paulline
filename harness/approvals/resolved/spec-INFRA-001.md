# Approval: spec — INFRA-001

**Type:** spec  
**Feature:** INFRA-001: Arquitectura Hexagonal en módulo Health  
**Created:** 2026-06-19  
**Status:** pending  

## Qué se decide

Revisar y aprobar la **especificación completa de INFRA-001**:
- Requisitos en EARS format (7 FRs, 4 NFRs, 8 ACs)
- Arquitectura: mover health → modules/health/, aplicar Hexagonal pattern
- Diseño propuesto: domain/, application/, infrastructure/ capas
- Traceabilidad R↔test

## Especificación

**Ubicación:** `harness/specs/INFRA-001-hexagonal-health/requirements.md`

**Requisitos Funcionales (EARS):**
- FR-1: Estructura Hexagonal aplicada (domain/, application/, infrastructure/)
- FR-2: Health check via GET /health (200 + JSON status + timestamp)
- FR-3: Módulo registrado en AppModule (inyección de deps OK)

**Requisitos No Funcionales:**
- NFR-1: Consistencia con otros módulos
- NFR-2: Tests pasan (>80% cobertura)
- NFR-3: Documentación clara

**Criterios de Aceptación:** 8
- [ ] Directorio apps/api/src/modules/health/ existe (domain/, application/, infrastructure/)
- [ ] domain/health-status.ts define value object / tipos
- [ ] application/health.service.ts implementa lógica
- [ ] infrastructure/health.controller.ts expone GET /health
- [ ] infrastructure/health.module.ts declara HealthModule
- [ ] No existen archivos en apps/api/src/health/
- [ ] Tests (service + controller) verdes
- [ ] Lint, typecheck pasan

## Origen

Hallazgo de audit_2026-06-19.md:
- **Hallazgo:** Módulo health fuera de modules/; no sigue Hexagonal
- **Severidad:** Importante
- **Solución:** INFRA-001 remedios

## Opciones

- **"aprobado"** → la spec es válida, avanzar a `in_progress` (implementer TDD)
- **"cambios"** → requiere revisión/ajustes (especifica qué)
- **"revisar"** → más evaluación antes de decidir

---

**¿Aprobada? Responde: "aprobado" / "cambios" / "revisar"**
