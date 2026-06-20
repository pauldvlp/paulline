# Approval: spec — INFRA-003

**Type:** spec  
**Feature:** INFRA-003: SDK Improvements (const as const)  
**Created:** 2026-06-19  
**Status:** pending  

## Qué se decide

Revisar y aprobar la **especificación de INFRA-003**:
- Problema: constantes en `packages/sdk/src/PaulineClient.ts` sin `as const`
- Solución: literalizar tipos (string → 'machines' | 'tunnels')
- Severidad: Menor (no bloquea)
- ACs: 4

## Especificación

**Ubicación:** `harness/specs/INFRA-003-sdk-improvements/requirements.md`

**Requisitos Funcionales (EARS):**
- FR-1: Constantes con tipo literal ('machines', 'tunnels')
- FR-2: Tipos actualizados en ResourceClient

**Requisitos No Funcionales:**
- NFR-1: Precisión de tipos (strict mode)
- NFR-2: Compatibilidad (runtime sin cambios)

**Criterios de Aceptación:** 4
- [ ] PaulineClient.ts: `const X = '...' as const` (lines 5-6)
- [ ] ResourceClient tipos actualizados (si aplica)
- [ ] Tests pasan (type inference)
- [ ] Typecheck sin errores

## Origen

Hallazgo de audit_2026-06-19.md:
- **Hallazgo:** `MACHINES_RESOURCE_PATH` y `TUNNELS_RESOURCE_PATH` sin `as const`
- **Severidad:** Menor (cosmético, pero importante para precisión)
- **Impacto:** Tipos menos específicos (`string` vs literal)

## Opciones

- **"aprobado"** → la spec es válida, avanzar a `in_progress`
- **"cambios"** → requiere revisión/ajustes
- **"revisar"** → más evaluación

---

**¿Aprobada? Responde: "aprobado" / "cambios" / "revisar"**
