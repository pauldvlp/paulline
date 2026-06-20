# Paulline v0.1 MVP — Features Summary

**Release Target:** v0.1.0  
**Milestone:** MVP (Minimum Viable Product)  
**Status:** Feature definitions ready for spec approval  

---

## Overview

Seven foundational features, in dependency order, define v0.1 MVP scope. Each feature includes comprehensive EARS-format requirements with acceptance criteria.

| # | ID | Name | Priority | Status | Depends On |
|---|---|------|----------|--------|------------|
| 1 | [SETUP-001](#setup-001) | Setup Monorepo & Docker Environment | P0 | In Review | None |
| 2 | [AUTH-001](#auth-001) | Cloudflare API Authentication | P0 | Ready | SETUP-001 |
| 3 | [MACHINES-001](#machines-001) | Machines CRUD & SSH Validation | P0 | Ready | SETUP-001, AUTH-001 |
| 4 | [TUNNELS-001](#tunnels-001) | Tunnels CRUD & State Management | P0 | Ready | SETUP-001, AUTH-001, MACHINES-001 |
| 5 | [MONITORING-001](#monitoring-001) | Uptime Monitoring & Historical Data | P0 | Ready | SETUP-001, MACHINES-001, TUNNELS-001 |
| 6 | [DASHBOARD-001](#dashboard-001) | Dashboard UI & Status Display | P1 | Ready | All above |
| 7 | [POLISH-001](#polish-001) | E2E Tests, Documentation & Release | P1 | Ready | All above |

---

## SETUP-001

**Setup Monorepo & Docker Environment**

### Goal
Establish the foundational scaffolding for a Node.js + TypeScript monorepo with NestJS backend, React frontend, and shared packages. Configure Docker for local development.

### Key Requirements (EARS)
- **FR-1:** Initialize pnpm workspaces (apps/, packages/) with correct structure
- **FR-2:** Install dependencies with `pnpm install` (deterministic via lock file)
- **FR-3:** Configure TypeScript across workspaces (root tsconfig + path aliases)
- **FR-4:** Setup Docker Compose (api:3000, web:5173, shared network)
- **FR-5:** Initialize SQLite database with Prisma migrations
- **FR-6:** Verify health checks (`GET /health`, React loads)
- **FR-7:** Document setup process (README/SETUP.md)

### Deliverables
- ✅ Monorepo structure (apps/api, apps/web, packages/*)
- ✅ pnpm-workspace.yaml + package.json per workspace
- ✅ docker-compose.yml (api, web, network)
- ✅ Prisma schema + SQLite initialization
- ✅ Setup documentation (< 5 min to complete)

### Acceptance (Key)
- [ ] `docker-compose up -d` starts both services without errors
- [ ] `http://localhost:3000/health` returns 200
- [ ] `http://localhost:5173` loads React app
- [ ] `pnpm install` and `pnpm run build` succeed across workspaces

**Full requirements:** `harness/specs/SETUP-001/requirements.md`

---

## AUTH-001

**Cloudflare API Authentication**

### Goal
Enable users to authenticate with their Cloudflare account via API key. Store and validate the key, fetch list of Cloudflare domains for use in tunnel creation.

### Key Requirements (EARS)
- **FR-1:** API key input form (UI) with masking
- **FR-2:** Validate key against Cloudflare API (test call)
- **FR-3:** Store key securely (encrypted/hashed in SQLite)
- **FR-4:** Use stored key for all Cloudflare API calls
- **FR-5:** Update/rotate key (settings page)
- **FR-6:** Fetch and cache Cloudflare domains (zones table)
- **FR-7:** Prevent unauthorized access to protected routes (401 if no auth)

### Deliverables
- ✅ Login form with API key input (masked)
- ✅ Backend validation endpoint: `POST /api/auth/validate-key`
- ✅ Cloudflare adapter (calls Cloudflare API)
- ✅ Zones cache table in database
- ✅ Session/token management (single-user v0.1)

### Acceptance (Key)
- [ ] Valid key passes validation; invalid key fails with clear error
- [ ] Key is stored encrypted (not plaintext)
- [ ] Cloudflare zones are fetched after successful auth
- [ ] Unauthenticated requests to `/api/machines`, `/api/tunnels` return 401

**Full requirements:** `harness/specs/AUTH-001/requirements.md`

---

## MACHINES-001

**Machines CRUD & SSH Validation**

### Goal
Allow users to register remote machines (servers) via IP/hostname and SSH connectivity validation. Provide full CRUD (Create, Read, Update, Delete) and status monitoring.

### Key Requirements (EARS)
- **FR-1:** List machines with status (online/offline)
- **FR-2:** Add machine (name + IP, validate SSH connectivity before storing)
- **FR-3:** Validate SSH key presence and format (key-based auth only)
- **FR-4:** Edit machine (update name/IP with re-validation)
- **FR-5:** Delete machine (blocked if tunnels exist)
- **FR-6:** Check machine status (online/offline indicator)
- **FR-7:** SSH key installation helper (optional v0.1)

### Deliverables
- ✅ Machines API endpoints (GET, POST, PATCH, DELETE)
- ✅ SSH validator adapter (tests connectivity)
- ✅ Machines list UI (table with status, edit/delete buttons)
- ✅ Add/Edit machine forms (React Hook Form + Zod)
- ✅ Status check job (background)

### Acceptance (Key)
- [ ] `POST /api/machines` validates SSH before storing
- [ ] Machine status updates (online/offline) based on SSH connectivity checks
- [ ] Delete is blocked if machine has active tunnels
- [ ] SSH timeout is max 10 seconds

**Full requirements:** `harness/specs/MACHINES-001/requirements.md`

---

## TUNNELS-001

**Tunnels CRUD & State Management**

### Goal
Allow users to create and manage Cloudflare tunnels, linking them to registered machines and Cloudflare domains. Provide full CRUD and state management (pause/resume).

### Key Requirements (EARS)
- **FR-1:** List tunnels with name, machine, port, domain, status
- **FR-2:** Create tunnel (machine + port + domain + subdomain, call Cloudflare API)
- **FR-3:** Edit tunnel (update port/subdomain)
- **FR-4:** Delete tunnel (call Cloudflare API, remove from DB)
- **FR-5:** Pause tunnel (disable routing)
- **FR-6:** Resume tunnel (re-enable routing)
- **FR-7:** Validate tunnel state periodically (sync with Cloudflare)
- **FR-8:** Persist tunnel config across restarts

### Deliverables
- ✅ Tunnels API endpoints (GET, POST, PATCH, DELETE, pause, resume)
- ✅ Cloudflare tunnel adapter (create/edit/delete/pause via Cloudflare API)
- ✅ Tunnels list UI (table with status, uptime %, action buttons)
- ✅ Create/Edit tunnel forms (dropdowns for machine/domain, text for subdomain)
- ✅ Status sync job (background, queries Cloudflare for drift detection)

### Acceptance (Key)
- [ ] `POST /api/tunnels` calls Cloudflare API and stores tunnel in DB
- [ ] Subdomain uniqueness validated (per domain)
- [ ] Pause/Resume update Cloudflare state
- [ ] Delete removes from both Cloudflare and local DB

**Full requirements:** `harness/specs/TUNNELS-001/requirements.md`

---

## MONITORING-001

**Uptime Monitoring & Historical Data**

### Goal
Continuously monitor tunnel health via HTTP reachability checks. Store 24-hour historical uptime data and compute statistics (uptime %, response time, outages).

### Key Requirements (EARS)
- **FR-1:** Background monitoring job (periodic, concurrent checks)
- **FR-2:** Uptime check: HTTP reachability (HEAD/GET to tunnel's public URL)
- **FR-3:** Uptime data storage (24-hour rolling window in uptime_events table)
- **FR-4:** Uptime calculation (uptime %, avg response time, longest outage)
- **FR-5:** Uptime data export (API for dashboard, time-series format)
- **FR-6:** Monitoring job robustness (error handling, continues on failure)
- **FR-7:** Paused tunnels skip monitoring (no checks)
- **FR-8:** Manual check trigger (user clicks "Check Now")

### Deliverables
- ✅ Monitoring service (background job, runs on interval)
- ✅ Uptime checker (HTTP reachability, timeout, response time)
- ✅ uptime_events table (tunnel_id, timestamp, status, response_time_ms)
- ✅ Cleanup job (expire data > 24h)
- ✅ Uptime stats API endpoint: `GET /api/monitoring/uptime/:tunnelId`

### Acceptance (Key)
- [ ] Monitoring job runs on schedule (60s or 5min interval)
- [ ] Uptime checks are concurrent (5-10 parallel)
- [ ] Uptime % = (success checks) / (total checks) * 100
- [ ] Data older than 24h is cleaned up automatically
- [ ] Dashboard can query and graph uptime stats

**Full requirements:** `harness/specs/MONITORING-001/requirements.md`

---

## DASHBOARD-001

**Dashboard UI & Status Display**

### Goal
Provide a central UI displaying machines and tunnels overview, their status (online/offline, active/paused), uptime statistics, and 24-hour uptime graphs. Enable quick actions (pause, resume, delete).

### Key Requirements (EARS)
- **FR-1:** Dashboard layout (header, sidebar, main content area)
- **FR-2:** Machines overview section (card/table, status, last check)
- **FR-3:** Tunnels overview section (row/card, status, uptime %, action buttons)
- **FR-4:** Uptime graph per tunnel (24h sparkline or small chart)
- **FR-5:** Detailed uptime stats (modal/inline, full graph + stats panel)
- **FR-6:** Real-time status updates (WebSocket or polling)
- **FR-7:** Quick actions (Pause, Resume, Delete, Check Now buttons)
- **FR-8:** Empty states (no machines/tunnels yet)
- **FR-9:** Responsive and accessible (mobile, tablet, desktop; WCAG AA)

### Deliverables
- ✅ Dashboard layout (React components, Atomic Design)
- ✅ Machines section (list with status indicators)
- ✅ Tunnels section (list with status, uptime %, action buttons)
- ✅ Uptime graph component (using Recharts or similar)
- ✅ Real-time update mechanism (polling or WebSocket)
- ✅ Responsive design (CSS Grid/Flexbox, Tailwind)
- ✅ Accessibility (contrast, keyboard nav, ARIA labels)

### Acceptance (Key)
- [ ] Dashboard displays all machines with status
- [ ] Dashboard displays all tunnels with status + uptime %
- [ ] Uptime graph shows 24-hour data (green for up, red for down)
- [ ] Quick actions (Pause, Delete) work from dashboard
- [ ] Dashboard is responsive on mobile (320px) and desktop (1920px)
- [ ] Initial load: < 2 seconds (LCP < 2s)

**Full requirements:** `harness/specs/DASHBOARD-001/requirements.md`

---

## POLISH-001

**E2E Tests, Documentation & Release**

### Goal
Complete v0.1 MVP with comprehensive end-to-end tests, user-facing documentation, developer documentation, and GitHub release preparation.

### Key Requirements (EARS)
- **FR-1:** E2E tests for auth flow (Playwright)
- **FR-2:** E2E tests for machines flow (add, edit, delete, list)
- **FR-3:** E2E tests for tunnels flow (create, pause, resume, delete)
- **FR-4:** E2E tests for dashboard flow (displays data, quick actions)
- **FR-5:** User documentation: Setup guide (`docs/SETUP.md`)
- **FR-6:** User documentation: Usage guide (`docs/USAGE.md`)
- **FR-7:** Developer documentation (architecture, API, contributing)
- **FR-8:** Changelog and release notes
- **FR-9:** Version bump and tagging (v0.1.0)
- **FR-10:** Final QA and polish (error messages, loading states, accessibility)
- **FR-11:** GitHub repository finalization (README, templates, license)

### Deliverables
- ✅ E2E test suite (Playwright, all critical user flows)
- ✅ Setup guide (SETUP.md, < 5 min to complete)
- ✅ Usage guide (USAGE.md, Cloudflare key, machines, tunnels, dashboard)
- ✅ Architecture docs (ARCHITECTURE.md, monorepo, hexagonal, atomic design)
- ✅ API docs (API.md or OpenAPI spec)
- ✅ Contributing guide (CONTRIBUTING.md, dev setup, testing, git workflow)
- ✅ CHANGELOG.md (v0.1 entry)
- ✅ GitHub release (v0.1.0 tag, release notes)
- ✅ README.md update (description, features, quick start, docs)
- ✅ License (MIT or equivalent)

### Acceptance (Key)
- [ ] E2E tests pass (0 failures, no flakes)
- [ ] E2E tests cover auth, machines, tunnels, dashboard flows
- [ ] `docs/SETUP.md` has clear step-by-step instructions
- [ ] `docs/USAGE.md` covers user scenarios (auth, machines, tunnels, dashboard)
- [ ] `docs/ARCHITECTURE.md` explains backend/frontend structure
- [ ] GitHub release published with v0.1.0 tag
- [ ] All error messages are clear (no stack traces)
- [ ] UI is polished (consistent styling, responsive)

**Full requirements:** `harness/specs/POLISH-001/requirements.md`

---

## Implementation Roadmap

### Phase 1: Foundation (SETUP-001)
- Initialize monorepo, Docker, database schema
- Verify all services start and are healthy
- **Duration:** 1-2 sessions

### Phase 2: Core Backend (AUTH-001, MACHINES-001, TUNNELS-001)
- Implement authentication (Cloudflare API key validation + storage)
- Implement machines CRUD + SSH validation
- Implement tunnels CRUD + Cloudflare API integration
- **Duration:** 4-5 sessions

### Phase 3: Monitoring & Dashboard (MONITORING-001, DASHBOARD-001)
- Implement background monitoring job + uptime data storage
- Implement dashboard UI (machines, tunnels, uptime graphs)
- Integrate real-time updates
- **Duration:** 3-4 sessions

### Phase 4: Polish & Release (POLISH-001)
- Write E2E tests (Playwright)
- Write user and developer documentation
- Final QA, polish, and GitHub release
- **Duration:** 2-3 sessions

### Total Estimated Duration
**10-14 sessions** (depending on complexity and scope refinement during implementation)

---

## Cross-Cutting Concerns

### Architecture
- **Backend:** Hexagonal architecture (domain, application, infrastructure)
- **Frontend:** Atomic Design (atoms, molecules, organisms, templates, pages)
- **Database:** Prisma ORM + SQLite (local persistence)
- **Validation:** Zod (single source of truth for schemas)

### Stack
- **Backend:** NestJS + TypeScript
- **Frontend:** React + TypeScript + shadcn/ui + Tailwind CSS
- **SDK:** PaulineClient (agnóstic, frontend ↔ backend)
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Deployment:** Docker Compose (local dev + production-like)

### Principles
- **Un artefacto por archivo** (one function/class/component per file)
- **No magic numbers/strings** (extract to named constants)
- **Validación centralizada** (Zod schemas in `packages/schemas`)
- **Frontend accede via SDK únicamente** (no direct HTTP from React)
- **TDD + E2E obligatorio** (red → green → refactor, no code without tests)
- **Un solo commit por feature** (en puerta de commit, tras approval)
- **Documentación en `progress/current.md`** mientras trabajas

---

## Next Steps

1. **Spec Review:** Humano revisa estas 7 features, solicita cambios/aprobación
2. **Approval:** Marca features como `spec_ready` → `APPROVED`
3. **Implementation:** `feat_author` → `implementer` por feature (o mismo persona)
4. **Verification:** Tests pasan, dashboard looks correct, E2E flujos validated

---

**Status:** Ready for spec review and human approval.
