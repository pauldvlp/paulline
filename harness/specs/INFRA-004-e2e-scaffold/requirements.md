# Requirements — INFRA-004: E2E Scaffold (Playwright Setup)

**Feature ID:** INFRA-004  
**Status:** pending  
**Severity:** Importante  
**Blocker for:** AUTH-001 (login E2E)  

## Descripción

Convenciones requieren E2E (Playwright) para flujos críticos. Feature instala Playwright, configura base, crea test ejemplo (health check), y documenta flujo E2E para próximas features.

## Requisitos Funcionales (EARS)

**FR-1: Playwright instalado y configurado**
- GIVEN `pnpm install` en repo root 
- WHEN se verifica `playwright.config.ts` y `apps/web/e2e/` 
- THEN existen config file y directorio; `pnpm exec playwright --version` funciona

**FR-2: Test E2E base funcional**
- GIVEN servidor running (docker-compose up) 
- WHEN se ejecuta `pnpm test:e2e` 
- THEN test GET /health pasa: endpoint responde 200

**FR-3: Estructura E2E escalable**
- GIVEN `apps/web/e2e/` 
- WHEN se inspeccionan archivos 
- THEN existen: fixtures.ts (helpers), setup.ts (precondiciones), README.md (instrucciones)

**FR-4: CI-ready**
- GIVEN GitHub Actions workflow (futuro) 
- WHEN E2E tests configurados 
- THEN compatible con `--headed=false`, screenshots en failure, reportes generados

## Requisitos No Funcionales (EARS)

**NFR-1: Performance**
- E2E tests rápidos (<5s por test); no timeouts innecesarios

**NFR-2: Documentación**
- README explica cómo ejecutar, debuggear, escribir nuevos tests

**NFR-3: Estabilidad**
- Tests determinísticos; sin flakiness; retries configurados

## Criterios de Aceptación

- [ ] `@playwright/test` instalado en `apps/web/package.json`
- [ ] `playwright.config.ts` existe en `apps/web/` con config base (browsers, timeout, baseURL)
- [ ] `apps/web/e2e/` contiene:
  - [ ] `health.spec.ts` — test GET /health → 200 OK
  - [ ] `fixtures.ts` — helper functions (authPage, apiCall, etc.)
  - [ ] `setup.ts` — precondiciones (mock auth, db reset si aplica)
  - [ ] `README.md` — instrucciones de ejecución
- [ ] Test E2E pasa en local: `pnpm test:e2e` verde
- [ ] Screenshots generados en failure
- [ ] `pnpm test:e2e --debug` permite inspeccionar en inspector
- [ ] Documentado en README principal (e2e section)
- [ ] No rompe ningún test existente

## Trazabilidad

| FR/NFR | Test | Verificación |
|--------|------|--------------|
| FR-1 | pnpm exec playwright | Version output OK; config valid |
| FR-2 | health.spec.ts | GET /health → 200 |
| FR-3 | (estructura) | Files present in e2e/ |
| FR-4 | (CI-ready) | Config supports headless, screenshots, reports |
| NFR-1 | (timing) | Test execution <5s |
| NFR-2 | README.md | Clear instructions present |
| NFR-3 | (stability) | No flaky tests; retries configured |
