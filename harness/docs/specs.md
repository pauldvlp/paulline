# Flujo SDD (Spec-Driven Development) — Paulline

## Qué es SDD

Spec-Driven Development = cada feature tiene una **especificación formal** (requirements + design + tasks) que:
1. **Clarifica** el "qué" y el "por qué" antes del código
2. **Abre puerta humana de aprobación** (spec_author → humano → aprobación)
3. **Divide implementación** en tareas discretas con criterios de aceptación
4. **Facilita reviews:** reviewer valida contra spec, no adivina la intención

## Estructura de una spec

```
harness/specs/<id>-<name>/
├── requirements.md          # QUÉ + POR QUÉ (EARS format)
├── design.md                # CÓMO (arquitectura, flujos, APIs)
└── tasks.md                 # Tareas discretas + criterios de aceptación
```

### `requirements.md` — Format EARS (Easy Approach to Requirements Syntax)

EARS es un formato estructurado para requerimientos que evita ambigüedad:

```markdown
# Requirements — Setup Monorepo [#SETUP-001]

## Context
Paulline es un monorepo Node.js con backend NestJS, frontend React, paquetes compartidos.
El setup inicial debe...

## Functional Requirements

### FR-1: Initialize monorepo
- **GIVEN** developer runs setup script
- **WHEN** script detects no pnpm-workspace.yaml
- **THEN** script creates minimal workspace structure:
  - apps/api/
  - apps/web/
  - packages/{database,sdk,schemas,types}
  - pnpm-workspace.yaml

### FR-2: Install dependencies
- **GIVEN** monorepo structure exists
- **WHEN** developer runs `pnpm install`
- **THEN** all workspace dependencies resolve (no conflicts)

### FR-3: Toolchain validation
- **GIVEN** monorepo is initialized
- **WHEN** developer runs `pnpm run build`
- **THEN** TS compiles without errors in all workspaces

## Non-Functional Requirements

### NFR-1: Setup time
- **GIVEN** clean environment
- **WHEN** developer runs setup
- **THEN** completes in < 2 minutes

### NFR-2: Clarity
- **GIVEN** error during setup
- **WHEN** script exits
- **THEN** error message is clear + actionable (not cryptic)

## Acceptance Criteria
- ✅ pnpm-workspace.yaml exists and is valid
- ✅ `pnpm install` succeeds
- ✅ `pnpm run build` succeeds across all workspaces
- ✅ setup time < 2 min
- ✅ error messages are clear

## Open Questions
- Should we include ESLint/Prettier setup in v0.1?
- Docker setup: local dev or included?
```

### `design.md` — Cómo se implementa

```markdown
# Design — Setup Monorepo

## Architecture

### Folder structure
```
paulline/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── database/
│   ├── sdk/
│   ├── schemas/
│   └── types/
├── harness/
├── pnpm-workspace.yaml
└── docker-compose.yml
```

### Technologies
- Monorepo tool: pnpm workspaces
- Package manager: pnpm
- Versioning: workspace versions unified

## Data & API Contracts
N/A (setup task, no APIs)

## Edge cases & error handling
- If workspace.yaml exists: skip, warn
- If pnpm not installed: error + install instructions
- If node version incompatible: error + version hint

## Dependencies & assumptions
- Node.js LTS pre-installed
- pnpm installed or will be installed by script
- Unix-like shell (bash/zsh) — Windows support: TBD
```

### `tasks.md` — Tareas + criterios de aceptación

```markdown
# Tasks — Setup Monorepo [#SETUP-001]

## Task 1: Initialize workspace structure
**Desc:** Create folder skeleton (apps/, packages/, pnpm-workspace.yaml)

**Subtasks:**
1. Create directories: apps/{api,web}, packages/{database,sdk,schemas,types}
2. Generate pnpm-workspace.yaml with:
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```
3. Create minimal package.json in each workspace

**Acceptance Criteria:**
- [ ] Folders exist and are git-tracked (except node_modules)
- [ ] pnpm-workspace.yaml is valid YAML
- [ ] `pnpm ls` shows all workspaces

## Task 2: Install dependencies
**Desc:** Run `pnpm install` and verify resolution

**Subtasks:**
1. Install root dependencies (if any: @types/node, etc.)
2. Run `pnpm install` (full monorepo)
3. Verify lockfile (pnpm-lock.yaml) is generated

**Acceptance Criteria:**
- [ ] No unresolved peer dependencies
- [ ] pnpm-lock.yaml committed
- [ ] `pnpm install` is idempotent (run twice = no changes)

## Task 3: Configure TypeScript
**Desc:** Set up tsconfig.json (root + workspace)

**Subtasks:**
1. Create tsconfig.json (root) with base config
2. Create tsconfig.json in each workspace, extending root
3. Verify `pnpm run build` compiles

**Acceptance Criteria:**
- [ ] All workspaces compile (TS target: ES2020)
- [ ] No TS errors
- [ ] Paths are resolvable (@paulline/sdk, @paulline/schemas, etc.)

## Task 4: Git initial commit
**Desc:** Commit scaffolding

**Criteria:**
- [ ] .gitignore excludes node_modules, .env, dist, build
- [ ] First commit with Conventional Commits format
```

---

## Ciclo de vida de una feature

1. **Descripción libre** (usuario/feat_author)
   → Idea en palabras: "Agregar máquina remota con SSH"

2. **`feat_author` redacta spec**
   → Crea `harness/specs/<id>-<name>/{requirements,design,tasks}.md`
   → Formato EARS, claro, sin ambigüedades

3. **`spec_author` revisa** (o humano)
   → ¿Los requirements son específicos (EARS)? ¿El design es claro? ¿Las tasks son discretas?
   → Cambios solicitados: marca `spec_ready` cuando OK

4. **Puerta: APPROVAL (spec)**
   → Humano revisa y aprueba: OK → feature → `in_progress`

5. **`implementer` codifica**
   → Sigue tasks; TDD (red → green → refactor)
   → Documenta avances en `progress/current.md`

6. **Tests + `reviewer` valida**
   → Reviewer comprueba contra spec; tests pasan; coverage OK
   → Marca `in_review` → `APPROVED`

7. **Puerta: APPROVAL (commit)**
   → Humano OK → `done`, commit + push

---

## Checklist para redactar una spec

- [ ] Requirements en formato EARS (GIVEN/WHEN/THEN)
- [ ] No ambigüedades ("fácil", "rápido" → números concretos)
- [ ] Acceptance criteria bien definidos (checkboxes)
- [ ] Design explica la arquitectura (no just code details)
- [ ] Tasks son discretas (una responsabilidad por task)
- [ ] Dependencies entre tasks están claras
- [ ] Open questions documentadas
- [ ] Specs linkan a otros specs si hay dependencias

---

## Ejemplo: Feature "Create Tunnel"

```
harness/specs/001-create-tunnel/
├── requirements.md        # User selects machine → port → domain → creates tunnel
├── design.md              # Backend API design, Cloudflare integration, SDK
└── tasks.md               # 1) API endpoint, 2) SDK method, 3) UI form, 4) Tests
```

**Requirements:**
- User autenticado
- Selecciona máquina ya agregada
- Ingresa puerto local
- Elige dominio Cloudflare y subdominio
- Crea tunel (backend llama Cloudflare API)
- Dashboard muestra tunel con status "creating"

**Design:**
- NestJS endpoint: `POST /api/tunnels`
- Validación Zod: port (1-65535), domain (regex), subdomain (alphanumeric)
- Cloudflare adapter: `createTunnel(domainId, name, …)`
- SDK: `paulline.tunnels().create({ machineId, port, domain, subdomain })`

**Tasks:**
1. Backend: NestJS controller + service + Cloudflare adapter
2. Frontend: form component (shadcn Form + Zod validation)
3. SDK: `PaulineClient.tunnels().create()`
4. Tests: unit (Cloudflare adapter mocked) + E2E (full flow)
