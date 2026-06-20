# Feature Review Checklist — v0.1 MVP

**Reviewer:** [Humano]  
**Fecha de revisión:** [TBD]  
**Status:** Pending approval  

---

## Instrucciones

Esta checklist valida que las 7 features de v0.1 sean claras, completas, y listas para implementación.

**Para pasar el gate:**
1. Revisor lee las 7 features en `harness/specs/<id>-<name>/requirements.md`
2. Valida cada feature contra esta checklist
3. Solicita cambios si es necesario (comentarios en este archivo)
4. Aprueba cada feature con ✅
5. Marca como `spec_ready` (y traslada a `APPROVED` tras OK final)

---

## SETUP-001: Setup Monorepo & Docker Environment

### Scope & Clarity
- [ ] ¿Feature es clara y sin ambigüedades?
- [ ] ¿Dependencias están bien identificadas (ninguna)?
- [ ] ¿Alcance (scope) está bien delimitado (qué sí, qué no)?

### Requirements
- [ ] ¿Requisitos funcionales están en EARS format?
- [ ] ¿Requisitos funcionales son específicos (sin "fácil", "rápido")?
- [ ] ¿Requisitos no-funcionales son medibles (< 5 min, < 2MB, etc.)?

### Acceptance Criteria
- [ ] ¿Acceptance criteria son checkables (no ambiguas)?
- [ ] ¿Acceptance criteria cubren todos los FRs?
- [ ] ¿Criterios son suficientes para validar feature completa?

### Open Questions
- [ ] ¿Preguntas abiertas están claramente formuladas?
- [ ] ¿Son decidibles antes de implementar, o pueden resolverse durante?

### Related Features
- [ ] ¿Dependencias con otras features están claras?
- [ ] ¿Features no-relacionadas no están listadas?

### Comments
```
[Escribir comentarios aquí]
```

### Verdict
- [ ] **APPROVED** — Feature está clara y lista para implementación
- [ ] **NEEDS CHANGES** — Comentarios arriba (requiere revisión)

---

## AUTH-001: Cloudflare API Authentication

### Scope & Clarity
- [ ] ¿Feature es clara y sin ambigüedades?
- [ ] ¿Dependencias están bien identificadas (SETUP-001)?
- [ ] ¿Alcance está bien delimitado?

### Requirements
- [ ] ¿Requisitos funcionales están en EARS format?
- [ ] ¿Requisitos funcionales son específicos?
- [ ] ¿Requisitos no-funcionales son medibles?

### Acceptance Criteria
- [ ] ¿Acceptance criteria son checkables?
- [ ] ¿Acceptance criteria cubren todos los FRs?
- [ ] ¿Criterios validan seguridad (key encryption, no plaintext)?

### Open Questions
- [ ] ¿Preguntas abiertas son respondibles antes de implementar?

### Related Features
- [ ] ¿Dependencias con MACHINES-001, TUNNELS-001 claras?

### Comments
```
[Escribir comentarios aquí]
```

### Verdict
- [ ] **APPROVED** — Feature está clara y lista para implementación
- [ ] **NEEDS CHANGES** — Comentarios arriba (requiere revisión)

---

## MACHINES-001: Machines CRUD & SSH Validation

### Scope & Clarity
- [ ] ¿Feature es clara y sin ambigüedades?
- [ ] ¿Dependencias están bien identificadas (SETUP-001, AUTH-001)?
- [ ] ¿Alcance está bien delimitado (qué del SSH key management)?

### Requirements
- [ ] ¿Requisitos funcionales están en EARS format?
- [ ] ¿Requisitos son específicos (timeout 10s, max 5 concurrent)?
- [ ] ¿Requisitos no-funcionales son medibles?

### Acceptance Criteria
- [ ] ¿Acceptance criteria son checkables?
- [ ] ¿Acceptance criteria cubren CRUD + SSH validation + status checks?
- [ ] ¿Criterios validan error handling (timeout, invalid IP)?

### Open Questions
- [ ] ¿SSH key location (file vs env) es decidible, o critical?
- [ ] ¿Machine IP uniqueness está clara (unique vs allow duplicates)?

### Related Features
- [ ] ¿Bloquea correctamente a TUNNELS-001?

### Comments
```
[Escribir comentarios aquí]
```

### Verdict
- [ ] **APPROVED** — Feature está clara y lista para implementación
- [ ] **NEEDS CHANGES** — Comentarios arriba (requiere revisión)

---

## TUNNELS-001: Tunnels CRUD & State Management

### Scope & Clarity
- [ ] ¿Feature es clara y sin ambigüedades?
- [ ] ¿Dependencias están bien identificadas (SETUP-001, AUTH-001, MACHINES-001)?
- [ ] ¿Alcance está bien delimitado (qué de Cloudflare API)?

### Requirements
- [ ] ¿Requisitos funcionales están en EARS format?
- [ ] ¿Requisitos son específicos (subdomain uniqueness, pause/resume)?
- [ ] ¿Requisitos no-funcionales son medibles?

### Acceptance Criteria
- [ ] ¿Acceptance criteria son checkables?
- [ ] ¿Acceptance criteria cubren CRUD + pause/resume + state sync?
- [ ] ¿Criterios validan Cloudflare API error handling?

### Open Questions
- [ ] ¿Tunnel naming (auto vs user-defined) puede esperar a design?
- [ ] ¿Local service reachability check es v0.1 o v0.2?

### Related Features
- [ ] ¿Bloquea correctamente a MONITORING-001, DASHBOARD-001?

### Comments
```
[Escribir comentarios aquí]
```

### Verdict
- [ ] **APPROVED** — Feature está clara y lista para implementación
- [ ] **NEEDS CHANGES** — Comentarios arriba (requiere revisión)

---

## MONITORING-001: Uptime Monitoring & Historical Data

### Scope & Clarity
- [ ] ¿Feature es clara y sin ambigüedades?
- [ ] ¿Dependencias están bien identificadas (SETUP-001, MACHINES-001, TUNNELS-001)?
- [ ] ¿Alcance está bien delimitado (qué data storage, qué cleanup)?

### Requirements
- [ ] ¿Requisitos funcionales están en EARS format?
- [ ] ¿Requisitos son específicos (concurrent limit, timeout, 24h window)?
- [ ] ¿Requisitos no-funcionales son medibles (uptime % calculation)?

### Acceptance Criteria
- [ ] ¿Acceptance criteria son checkables?
- [ ] ¿Acceptance criteria cubren job execution, data storage, cleanup, calculations?
- [ ] ¿Criterios validan robustness (error handling, job restart)?

### Open Questions
- [ ] ¿Check interval (60s vs 5min) puede decidirse en design?
- [ ] ¿Granularidad de datos (per-check vs aggregated) puede esperar a implementation?

### Related Features
- [ ] ¿Bloquea correctamente a DASHBOARD-001?

### Comments
```
[Escribir comentarios aquí]
```

### Verdict
- [ ] **APPROVED** — Feature está clara y lista para implementación
- [ ] **NEEDS CHANGES** — Comentarios arriba (requiere revisión)

---

## DASHBOARD-001: Dashboard UI & Status Display

### Scope & Clarity
- [ ] ¿Feature es clara y sin ambigüedades?
- [ ] ¿Dependencias están bien identificadas (todas las anteriores)?
- [ ] ¿Alcance está bien delimitado (UI only, no business logic)?

### Requirements
- [ ] ¿Requisitos funcionales están en EARS format?
- [ ] ¿Requisitos son específicos (layout, sections, real-time updates)?
- [ ] ¿Requisitos no-funcionales son medibles (< 2s load, responsive)?

### Acceptance Criteria
- [ ] ¿Acceptance criteria son checkables?
- [ ] ¿Acceptance criteria cubren layout, machines, tunnels, graphs, actions, empty states, accessibility?
- [ ] ¿Criterios validan responsiveness (mobile, tablet, desktop)?

### Open Questions
- [ ] ¿Chart library (Recharts vs Chart.js) puede decidirse en design?
- [ ] ¿Real-time mechanism (WebSocket vs polling) puede esperar a design?

### Related Features
- [ ] ¿Depende correctamente de MONITORING-001?

### Comments
```
[Escribir comentarios aquí]
```

### Verdict
- [ ] **APPROVED** — Feature está clara y lista para implementación
- [ ] **NEEDS CHANGES** — Comentarios arriba (requiere revisión)

---

## POLISH-001: E2E Tests, Documentation & Release

### Scope & Clarity
- [ ] ¿Feature es clara y sin ambigüedades?
- [ ] ¿Dependencias están bien identificadas (todas las anteriores)?
- [ ] ¿Alcance está bien delimitado (tests + docs + release, qué docs)?

### Requirements
- [ ] ¿Requisitos funcionales están en EARS format?
- [ ] ¿Requisitos son específicos (E2E flows, doc files, release steps)?
- [ ] ¿Requisitos no-funcionales son medibles (0 test flakes, doc clarity)?

### Acceptance Criteria
- [ ] ¿Acceptance criteria son checkables?
- [ ] ¿Acceptance criteria cubren E2E tests, setup guide, usage guide, dev docs, changelog, release tag?
- [ ] ¿Criterios validan test coverage (critical flows)?

### Open Questions
- [ ] ¿E2E test infrastructure (mock vs sandbox) puede decidirse en design?
- [ ] ¿Docker image build/push vs docker-compose link puede esperar a design?

### Related Features
- [ ] ¿Valida correctamente todas las features anteriores?

### Comments
```
[Escribir comentarios aquí]
```

### Verdict
- [ ] **APPROVED** — Feature está clara y lista para implementación
- [ ] **NEEDS CHANGES** — Comentarios arriba (requiere revisión)

---

## Overall Assessment

### Completeness
- [ ] ¿Las 7 features cubren el scope del charter v0.1?
- [ ] ¿Hay gaps (features faltantes)?
- [ ] ¿Hay over-scope (features que no pertenecen a v0.1)?

### Dependencies
- [ ] ¿Dependency graph es acíclico?
- [ ] ¿Dependencias son correctas y necesarias?

### Clarity
- [ ] ¿Todas las features evitan ambigüedades?
- [ ] ¿Preguntas abiertas son manejables en design/implementation?

### Quality
- [ ] ¿EARS format es consistente en todas las features?
- [ ] ¿Acceptance criteria son medibles?
- [ ] ¿Open questions son respondibles?

### Recommendation
- [ ] **APPROVE ALL** — Features están listas para spec review + implementation
- [ ] **REQUEST CHANGES** — Ver comentarios individuales arriba
- [ ] **REQUEST NEW FEATURE** — Hay gap(s) no cubierto(s)

---

## Reviewer Signature

**Revisado por:** [Nombre]  
**Fecha:** [YYYY-MM-DD]  
**Status final:** [ ] APPROVED / [ ] NEEDS CHANGES / [ ] REQUEST MORE INFO  

**Comentarios generales:**
```
[Escribir comentarios generales aquí]
```

---

## Next Steps After Approval

1. **Mark features as `spec_ready`** (en GitHub Issues o tracking interno)
2. **Create implementation tasks** (uno por feature, con acceptance criteria)
3. **Assign implementer(s)** (una persona por feature, o rota)
4. **Start Phase 1 (SETUP-001)** — foundation first
5. **Document progress** in `harness/progress/current.md` cada sesión

---

**Ubicación de features:**
- SETUP-001: `harness/specs/SETUP-001/requirements.md`
- AUTH-001: `harness/specs/AUTH-001/requirements.md`
- MACHINES-001: `harness/specs/MACHINES-001/requirements.md`
- TUNNELS-001: `harness/specs/TUNNELS-001/requirements.md`
- MONITORING-001: `harness/specs/MONITORING-001/requirements.md`
- DASHBOARD-001: `harness/specs/DASHBOARD-001/requirements.md`
- POLISH-001: `harness/specs/POLISH-001/requirements.md`

**Resumen:** `harness/backlog/FEATURES_v01.md`
