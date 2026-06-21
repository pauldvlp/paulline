# Approval: spec — INFRA-004

**Type:** spec  
**Feature:** INFRA-004: E2E Scaffold (Playwright Setup)  
**Created:** 2026-06-19  
**Status:** pending  

## Qué se decide

Revisar y aprobar la **especificación de INFRA-004**:
- Problema: Convention requiere E2E (Playwright) para flujos críticos; no hay scaffold
- Solución: Instalar Playwright, crear estructura base, demo test (health check)
- Severidad: Importante (bloqueante para AUTH-001)
- ACs: 9

## Especificación

**Ubicación:** `harness/specs/INFRA-004-e2e-scaffold/requirements.md`

**Requisitos Funcionales (EARS):**
- FR-1: Playwright instalado + configurado (playwright.config.ts)
- FR-2: Test E2E base funcional (GET /health → 200)
- FR-3: Estructura escalable (fixtures, setup, README)
- FR-4: CI-ready (headless, screenshots, reportes)

**Requisitos No Funcionales:**
- NFR-1: Performance (<5s por test)
- NFR-2: Documentación clara
- NFR-3: Tests determinísticos (no flaky)

**Criterios de Aceptación:** 9
- [ ] @playwright/test instalado
- [ ] playwright.config.ts en apps/web/
- [ ] apps/web/e2e/ con health.spec.ts, fixtures.ts, setup.ts, README.md
- [ ] Test health.spec.ts pasa (GET /health → 200)
- [ ] Screenshots en failure
- [ ] `pnpm test:e2e --debug` funciona
- [ ] Documentado en README principal
- [ ] No rompe tests existentes
- [ ] CI-compatible (headless, retries)

## Origen

Hallazgo de audit_2026-06-19.md:
- **Hallazgo:** Convention requiere E2E; no hay Playwright setup
- **Severidad:** Importante
- **Bloqueante para:** AUTH-001 (login E2E)

## Opciones

- **"aprobado"** → spec válida, avanzar a `in_progress`
- **"cambios"** → requiere revisión
- **"revisar"** → más evaluación

---

**¿Aprobada? Responde: "aprobado" / "cambios" / "revisar"**
