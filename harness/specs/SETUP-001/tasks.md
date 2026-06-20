# Tasks — SETUP-001: Monorepo & Docker Environment

> Each task is discrete, single-responsibility, with verifiable acceptance criteria. Traces to [`requirements.md`](./requirements.md) FRs and [`design.md`](./design.md).

## Task 1: Root Package & Workspace Setup

**Description:** Initialize root `package.json`, `pnpm-workspace.yaml`, base TS config, and `.gitignore`.

**Traces to:** FR-1, FR-6

**Subtasks:**
1. Create root `package.json` with scripts: `dev`, `build`, `test`, `lint`, `db:push`, `db:generate` (fan out with `pnpm -r` / `pnpm --filter`), and shared devDependencies (TypeScript, ESLint, Prettier, Vitest).
2. Create `pnpm-workspace.yaml` pointing to `apps/*` and `packages/*`.
3. Create `tsconfig.base.json` with strict base compiler options + `@paulline/*` path aliases.
4. Create `.gitignore` (`node_modules`, `.env`, `dist`/`build`, `data/*.db`, Prisma generated client).
5. Create `.env.example` with the variables defined in design.md.

**Acceptance Criteria:**
- [ ] `pnpm install` resolves all dependencies without conflicts (FR-1).
- [ ] Workspace packages link via `workspace:*`.
- [ ] No hoisting conflicts; `pnpm -r exec tsc --noEmit` reports no config errors.
- [ ] `.env.example` contains NODE_ENV, DATABASE_URL, API_PORT, WEB_PORT, VITE_API_URL.

---

## Task 2: Database Package Setup

**Description:** Initialize `packages/database` (Prisma + SQLite).

**Traces to:** FR-5

**Subtasks:**
1. Create `packages/database/package.json` (deps: `@prisma/client`; devDeps: `prisma`, `@types/node`; scripts: `db:push`, `db:generate`, `db:reset`).
2. Create `packages/database/tsconfig.json` (extends root base).
3. Create `packages/database/prisma/schema.prisma` (`provider = sqlite`, `url = env("DATABASE_URL")`, scaffold models: User, Machine, Tunnel, UptimeRecord — structure only).
4. Create `packages/database/src/index.ts` exporting a single PrismaClient instance.

**Acceptance Criteria:**
- [ ] `pnpm run db:generate` produces the Prisma client.
- [ ] `pnpm run db:push` creates `./data/paulline.db` with the scaffold schema (FR-5).
- [ ] No TypeScript errors; `@paulline/database` importable.

---

## Task 3: Schemas Package Setup

**Description:** Initialize `packages/schemas` (Zod — single validation source).

**Traces to:** Foundation for shared validation.

**Subtasks:**
1. Create `packages/schemas/package.json` (dependency: `zod`).
2. Create `packages/schemas/tsconfig.json`.
3. Create scaffold files `auth.ts`, `machines.ts`, `tunnels.ts` (placeholders, filled in feature specs).
4. Create `packages/schemas/src/index.ts` re-exporting all schemas.

**Acceptance Criteria:**
- [ ] Zod installed; all schema files compile.
- [ ] `@paulline/schemas` exports resolve with type inference available.
- [ ] No TypeScript errors.

---

## Task 4: Types Package Setup

**Description:** Initialize `packages/types` (TS types inferred from schemas).

**Traces to:** Foundation for shared types.

**Subtasks:**
1. Create `packages/types/package.json` (dependency: `@paulline/schemas`).
2. Create `packages/types/tsconfig.json`.
3. Create `packages/types/src/index.ts` re-exporting `z.infer`-derived types from schemas.

**Acceptance Criteria:**
- [ ] Types inferred from `@paulline/schemas` with no circular dependency.
- [ ] No TypeScript errors.

---

## Task 5: SDK Package Setup

**Description:** Initialize `packages/sdk` (PaulineClient — sole FE↔BE channel).

**Traces to:** Foundation; enforces "no scattered fetch" rule.

**Subtasks:**
1. Create `packages/sdk/package.json` (deps: `@paulline/schemas`, `@paulline/types`).
2. Create `packages/sdk/tsconfig.json`.
3. Create `packages/sdk/src/PaulineClient.ts` (skeleton: constructor with base URL config, fluent API stubs — no implementation).
4. Create `packages/sdk/src/index.ts` exporting PaulineClient.

**Acceptance Criteria:**
- [ ] PaulineClient instantiable with a base URL.
- [ ] Fluent API method stubs typed (no implementation yet).
- [ ] No TypeScript errors; respects `schemas → types → sdk` direction (no cycles).

---

## Task 6: Backend (API) App Setup

**Description:** Initialize `apps/api` (NestJS, Hexagonal-ready).

**Traces to:** FR-4, FR-7

**Subtasks:**
1. Create `apps/api/package.json` (deps: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-*`, `reflect-metadata`, `@paulline/database`, `@paulline/schemas`, `@paulline/types`; devDeps: `@nestjs/cli`, `tsconfig-paths`; scripts: `start:dev` via `nest start --watch`).
2. Create `apps/api/tsconfig.json` + `nest-cli.json` (path aliases for `@paulline/*`).
3. Create `apps/api/src/main.ts` (NestJS bootstrap, listens on `API_PORT`).
4. Create `apps/api/src/app.module.ts` (root module).
5. Create `apps/api/src/config/` (Zod-validated env module — no direct `process.env`).
6. Create `apps/api/src/common/` (filters, interceptors, pipes dirs).
7. Create `apps/api/src/health/` (health module + `GET /health` → `200` + JSON).
8. Create empty module scaffolds: `auth/`, `machines/`, `tunnels/`, `monitoring/`.

**Acceptance Criteria:**
- [ ] NestJS app bootstraps without errors.
- [ ] `pnpm --filter api start:dev` starts dev server with watch.
- [ ] `GET /health` returns `200` + JSON (FR-4).
- [ ] Env read only through validated config module.
- [ ] TypeScript compilation succeeds.

---

## Task 7: Frontend (Web) App Setup

**Description:** Initialize `apps/web` (React + Vite, Atomic Design + Tailwind).

**Traces to:** FR-3, FR-7

**Subtasks:**
1. Create `apps/web/package.json` (deps: `react`, `react-dom`, `@paulline/sdk`, `@paulline/schemas`, `@paulline/types`; devDeps: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`).
2. Create `apps/web/vite.config.ts` (React plugin, `--host`, dev proxy `/api → VITE_API_URL`).
3. Create `apps/web/tsconfig.json` (DOM lib, `@paulline/*` aliases).
4. Create `apps/web/index.html` entry point.
5. Create `apps/web/src/main.tsx` (React root) + `apps/web/src/App.tsx` (renders "Hello Paulline").
6. Create `apps/web/src/index.css` with Tailwind directives; wire shadcn/ui base config.
7. Create Atomic Design dirs: `atoms/`, `molecules/`, `organisms/`, `templates/`, `pages/` plus `hooks/`, `context/`, `utils/`.

**Acceptance Criteria:**
- [ ] Vite dev server starts on `5173`.
- [ ] React app renders "Hello Paulline" at `http://localhost:5173` (FR-3).
- [ ] Editing `App.tsx` triggers HMR without full reload (FR-7).
- [ ] API proxy configured (`/api → http://api:3000` in container).
- [ ] TypeScript compilation succeeds.

---

## Task 8: Docker Compose Setup

**Description:** Create `docker-compose.yml` + dev Dockerfiles for local development.

**Traces to:** FR-2, FR-7

**Subtasks:**
1. Create `apps/api/Dockerfile.dev` and `apps/web/Dockerfile.dev` (Node LTS, `pnpm install`, watch/dev command).
2. Create `docker-compose.yml`: services `api` (3000) + `web` (5173); shared `paulline` network; `web depends_on api`.
3. Configure volumes: `apps/api/src`, `apps/web/src`, `packages/*/src`, `./data`; keep `node_modules` image-internal.
4. Configure environment from `.env` (NODE_ENV, DATABASE_URL, API_PORT, WEB_PORT, VITE_API_URL).
5. Add inline comments documenting setup steps.

**Acceptance Criteria:**
- [ ] `docker-compose up -d` starts both services without errors (FR-2).
- [ ] `curl http://localhost:3000/health` → `200`.
- [ ] `http://localhost:5173` loads the React app.
- [ ] Source edits trigger hot reload with no manual restart (FR-7).
- [ ] Containers communicate (web resolves `http://api:3000`).

---

## Task 9: Documentation & README

**Description:** Write setup and development docs.

**Traces to:** AC "README with setup steps".

**Subtasks:**
1. Update `README.md`: setup (clone → `pnpm install` → `pnpm run db:push` → `docker-compose up -d`), dev workflow, directory structure, troubleshooting (ports in use, missing `./data`).
2. Create `harness/docs/DEVELOPMENT.md`: apps vs packages, Hexagonal module structure, Atomic Design components, step-by-step "add a new feature / package / module".

**Acceptance Criteria:**
- [ ] README covers setup end-to-end (< 5 min, no external credentials).
- [ ] DEVELOPMENT.md explains folder structure and common tasks.
- [ ] Troubleshooting section present.

---

## Task 10: Verification & Validation

**Description:** Validate the full setup locally against all acceptance criteria.

**Traces to:** FR-1 through FR-7 + all requirements.md AC.

**Subtasks:**
1. Fresh `pnpm install` → all deps resolve.
2. `pnpm run db:push` → SQLite schema created under `./data`.
3. `docker-compose up -d` → both services start.
4. `curl http://localhost:3000/health` → `200`.
5. Open `http://localhost:5173` → React app loads.
6. Edit `apps/web/src/App.tsx` → HMR reflects change; edit api source → rebuild < 5s.
7. `pnpm -r exec tsc --noEmit` → no TypeScript errors in any workspace.
8. Run `harness/init.sh` → passes.

**Acceptance Criteria:**
- [ ] Full setup completes in < 5 minutes with no manual intervention.
- [ ] Disk footprint < 2GB.
- [ ] Every acceptance criterion in `requirements.md` verified.
- [ ] `harness/init.sh` passes.
- [ ] Ready to start AUTH-001.
```
