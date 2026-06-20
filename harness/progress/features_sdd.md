# SDD Feature Definitions — v0.1 MVP

**Sesión:** Feature authoring (feat_author role)  
**Fecha:** 2026-06-19  
**Estado:** Features redactadas en EARS format, listas para spec review  

---

## Resumen

Se han redactado **7 features iniciales** de v0.1 MVP en formato EARS (GIVEN/WHEN/THEN). Cada feature incluye:
- Contexto (por qué es importante)
- Requisitos funcionales (EARS format)
- Requisitos no-funcionales
- Criterios de aceptación (checkboxes)
- Preguntas abiertas (design decisions pendientes)
- Dependencias y relaciones

---

## Features creadas

### 1. SETUP-001: Setup Monorepo & Docker Environment
- **Ubicación:** `harness/specs/SETUP-001/requirements.md`
- **Alcance:** Monorepo pnpm + Docker Compose + Prisma + TypeScript config
- **Dependencias:** Ninguna (foundation)
- **FRs principales:**
  - Initialize pnpm workspaces
  - Install dependencies (deterministic)
  - TypeScript configuration
  - Docker Compose setup
  - Prisma DB initialization
  - Health checks
  - Documentation

### 2. AUTH-001: Cloudflare API Authentication
- **Ubicación:** `harness/specs/AUTH-001/requirements.md`
- **Alcance:** API key input, validation, storage, session management
- **Dependencias:** SETUP-001
- **FRs principales:**
  - Login form (masked input)
  - Validate key with Cloudflare API
  - Store key securely (encrypted)
  - Use key for all Cloudflare calls
  - Rotate/update key
  - Fetch and cache Cloudflare domains
  - Prevent unauthorized access

### 3. MACHINES-001: Machines CRUD & SSH Validation
- **Ubicación:** `harness/specs/MACHINES-001/requirements.md`
- **Alcance:** CRUD máquinas remotas, validación SSH, status monitoring
- **Dependencias:** SETUP-001, AUTH-001
- **FRs principales:**
  - List machines (online/offline)
  - Add machine (SSH validation before store)
  - Edit machine (re-validate SSH)
  - Delete machine (blocked if tunnels exist)
  - Check machine status (background job)
  - SSH key validation
  - Helper para SSH key installation

### 4. TUNNELS-001: Tunnels CRUD & State Management
- **Ubicación:** `harness/specs/TUNNELS-001/requirements.md`
- **Alcance:** CRUD tuneles Cloudflare, state (active/paused), validación
- **Dependencias:** SETUP-001, AUTH-001, MACHINES-001
- **FRs principales:**
  - List tunnels
  - Create tunnel (call Cloudflare API)
  - Edit tunnel
  - Delete tunnel
  - Pause/resume tunnel
  - Validate tunnel state (periodic sync with Cloudflare)
  - Persist config across restarts

### 5. MONITORING-001: Uptime Monitoring & Historical Data
- **Ubicación:** `harness/specs/MONITORING-001/requirements.md`
- **Alcance:** Background job, HTTP reachability checks, 24h data storage
- **Dependencias:** SETUP-001, MACHINES-001, TUNNELS-001
- **FRs principales:**
  - Background monitoring job (concurrent, on schedule)
  - HTTP reachability check (timeout, response time)
  - Uptime data storage (24h rolling window)
  - Uptime calculations (%, avg response, longest outage)
  - Data export (for dashboard)
  - Job robustness (error handling)
  - Skip paused tunnels
  - Manual check trigger

### 6. DASHBOARD-001: Dashboard UI & Status Display
- **Ubicación:** `harness/specs/DASHBOARD-001/requirements.md`
- **Alcance:** UI central, machines overview, tunnels overview, uptime graphs
- **Dependencias:** SETUP-001, AUTH-001, MACHINES-001, TUNNELS-001, MONITORING-001
- **FRs principales:**
  - Dashboard layout (header, sidebar, main area)
  - Machines section (status, last check)
  - Tunnels section (status, uptime %, action buttons)
  - Uptime graphs (24h sparkline + detail modal)
  - Real-time updates (WebSocket/polling)
  - Quick actions (Pause, Resume, Delete, Check Now)
  - Empty states
  - Responsive + accessible

### 7. POLISH-001: E2E Tests, Documentation & Release
- **Ubicación:** `harness/specs/POLISH-001/requirements.md`
- **Alcance:** E2E tests + user docs + dev docs + release prep
- **Dependencias:** Todas las features anteriores
- **FRs principales:**
  - E2E tests (auth, machines, tunnels, dashboard flows)
  - User docs (SETUP.md, USAGE.md)
  - Dev docs (ARCHITECTURE.md, API.md, CONTRIBUTING.md)
  - Changelog + release notes
  - Version bump + tagging (v0.1.0)
  - Final QA (error messages, polish, accessibility)
  - GitHub repo finalization (README, templates, license)

---

## Archivos generados

| Archivo | Propósito |
|---------|-----------|
| `harness/specs/SETUP-001/requirements.md` | Feature definition (EARS format) |
| `harness/specs/AUTH-001/requirements.md` | Feature definition (EARS format) |
| `harness/specs/MACHINES-001/requirements.md` | Feature definition (EARS format) |
| `harness/specs/TUNNELS-001/requirements.md` | Feature definition (EARS format) |
| `harness/specs/MONITORING-001/requirements.md` | Feature definition (EARS format) |
| `harness/specs/DASHBOARD-001/requirements.md` | Feature definition (EARS format) |
| `harness/specs/POLISH-001/requirements.md` | Feature definition (EARS format) |
| `harness/backlog/FEATURES_v01.md` | Resumen de features (tabla + descripciones) |
| `harness/progress/features_sdd.md` | Este archivo |

---

## Decisiones de diseño aún pendientes

### SETUP-001
- Node.js LTS version (20 o 20+)
- Windows support (bash only o cross-platform)
- Env-config para local dev (todas las vars o solo esenciales)

### AUTH-001
- Session management: JWT, cookies, o in-memory (single-user)
- Key encryption: bcrypt, AES, o simple obfuscation
- Key storage: SQLite only o también env var

### MACHINES-001
- SSH key location: file path, env var, o mounted volume Docker
- Key generation: auto o instrucciones
- Machine IP uniqueness: unique o allow duplicates con names diferentes
- SSH port: hardcoded 22 o configurable (v0.1 = hardcoded)
- Concurrent limit: 5, 10, o auto-tune

### TUNNELS-001
- Tunnel naming: auto-generate from subdomain o user-defined
- Machine state: can tunnels be created for offline machines
- Cloudflare tunnel type: managed API vs cloudflared daemon
- Local service reachability: verify service running before creating tunnel
- Tunnel limit: handle quota gracefully

### MONITORING-001
- Check interval: 60s (real-time) o 5min (less load)
- Uptime granularity: per-check o pre-aggregated (hourly/5min buckets)
- Response time averaging: include failed checks o only successful
- Cleanup retention: hard 24h o configurable
- Alert/notification: v0.1 o v0.2

### DASHBOARD-001
- Chart library: Recharts, Chart.js, o custom SVG
- Real-time updates: WebSocket o polling 60s
- Drill-down navigation: separate page o modal
- Metrics aggregation: pre-aggregate uptime o query raw data
- Settings page: v0.1 o defer to POLISH-001

### POLISH-001
- E2E test infrastructure: mock Cloudflare API o sandbox/staging account
- E2E test data: fixtures o create/delete during tests
- Docker image: build + push o link to docker-compose
- GitHub release assets: compiled binaries o link to docker-compose
- Versioning: semantic (0.1.0) o calver (2024.06)

---

## Próximos pasos

### 1. Spec Review (humano)
- Revisar las 7 features definidas en EARS format
- Solicitar cambios/aclaraciones si es necesario
- Validar que requirements no sean ambiguas
- Checking: acceptance criteria son medibles

### 2. Approval
- Marcar features como `spec_ready` (en GitHub Issues, si se usan)
- Aprobar cada feature individualmente o en batch
- Status: `APPROVED` → listo para implementación

### 3. Implementation Planning
- **Fase 1 (SETUP-001):** Solo SETUP-001 (foundation)
- **Fase 2 (AUTH + CRUD):** AUTH-001, MACHINES-001, TUNNELS-001 (pueden run en paralelo)
- **Fase 3 (Monitoring + Dashboard):** MONITORING-001, DASHBOARD-001
- **Fase 4 (Polish):** POLISH-001 (al final)

### 4. Assignation
- Decidir si una persona implementa todas las features o se reparten
- Crear tasks en backlog (GitHub Issues con label `v0.1`)
- Asignar persona por feature o batch de features

### 5. Implementation
- Cada feature: `pending` (design) → `in_progress` (coding) → `in_review` (PR) → `APPROVED` (merged) → `done`
- TDD obligatorio: red → green → refactor
- Documentar avances en `progress/current.md` cada sesión

---

## Validación de cobertura

### Scope v0.1 (del charter)
- ✅ Auth Cloudflare: AUTH-001
- ✅ Gestión de máquinas (CRUD): MACHINES-001
- ✅ Gestión de tuneles (CRUD + pause): TUNNELS-001
- ✅ Dashboard (status + uptime 24h): DASHBOARD-001 + MONITORING-001
- ✅ Persistencia SQLite: SETUP-001 (Prisma)
- ✅ Autenticación local (single-user): AUTH-001
- ✅ Dockerización: SETUP-001
- ✅ E2E tests: POLISH-001
- ✅ Documentación: POLISH-001

### NO-scope v0.1 (deliberadamente out)
- ❌ Logs detallados: no incluido
- ❌ Alertas/notificaciones: no incluido
- ❌ Multi-proveedor: no incluido
- ❌ Multi-usuario/RBAC: no incluido
- ❌ Backups/snapshots: no incluido
- ❌ Métricas avanzadas: no incluido

---

## Formato de requisitos

Todas las features siguen:

```markdown
## Functional Requirements

### FR-N: Descripción
- **GIVEN** precondición
- **WHEN** acción
- **THEN** resultado esperado
```

Este formato EARS (Easy Approach to Requirements Syntax) evita ambigüedades y facilita:
- Testing (cada FR → test cases)
- Implementación (requisitos claros)
- Acceptance (criterios checkeable)

---

## Control de calidad interna

✅ Todas las features tienen:
- [ ] Título descriptivo (sustantivo + verbo)
- [ ] Contexto claro (por qué importa)
- [ ] Requisitos en EARS format
- [ ] Requisitos no-funcionales (performance, security, UX)
- [ ] Acceptance criteria (checkboxes)
- [ ] Preguntas abiertas
- [ ] Dependencias
- [ ] Features relacionadas

✅ Dependencias son acíclicas:
```
SETUP-001 (ninguna dependencia)
├─ AUTH-001
├─ MACHINES-001 (← AUTH-001)
│  ├─ TUNNELS-001 (← AUTH-001, MACHINES-001)
│  │  ├─ MONITORING-001 (← MACHINES-001, TUNNELS-001)
│  │  └─ DASHBOARD-001 (← MONITORING-001)
│  └─ MONITORING-001 (← MACHINES-001, TUNNELS-001)
└─ DASHBOARD-001 (← MONITORING-001)
   └─ POLISH-001 (← todas)
```

✅ No hay ambigüedades:
- "Fácil" → "< 2 segundos" (FR-3 SETUP-001)
- "Rápido" → "timeout 10 segundos" (FR-2 MACHINES-001)
- "Trabajar bien" → "uptime % = (success) / (total) * 100" (FR-4 MONITORING-001)

---

## Estado actual

| Estado | Descripción |
|--------|-------------|
| ✅ Redacción | 7 features en EARS format |
| ✅ Validación interna | Dependencias, cobertura, claridad |
| ⏳ Spec review | Esperando aprobación humana |
| ⏳ Implementation | Tras aprobación |

---

**Próximo:** Spec review + aprobación → crear GitHub Issues (si no existen) → comenzar SETUP-001 implementation
