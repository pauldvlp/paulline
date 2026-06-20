# Design — SETUP-001: Monorepo & Docker Environment

> Implements the requirements in [`requirements.md`](./requirements.md). This document describes **how** the foundation is built; it does not restate the FRs.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       Developer Machine                          │
│                                                                  │
│   $ pnpm install            (link workspaces, hoist deps)        │
│   $ pnpm run db:push        (generate Prisma client + SQLite)    │
│   $ docker-compose up -d    (boot dev stack)                     │
│                                                                  │
│  ┌────────────────────────── docker network: paulline ───────┐  │
│  │                                                            │  │
│  │   ┌───────────────────┐         ┌───────────────────────┐ │  │
│  │   │  api (NestJS)      │  HTTP   │  web (React + Vite)    │ │  │
│  │   │  container         │◄────────│  container             │ │  │
│  │   │  :3000             │  api:3000│  :5173                │ │  │
│  │   │  GET /health → 200 │         │  HMR dev server        │ │  │
│  │   └─────────┬─────────┘         └───────────┬───────────┘ │  │
│  │             │                               │             │  │
│  │   volume: ./apps/api/src           volume: ./apps/web/src │  │
│  │             │                               │             │  │
│  └─────────────┼───────────────────────────────┼─────────────┘  │
│                │                                                 │
│        ┌───────▼────────┐                                        │
│        │ SQLite          │   volume: ./data → /app/data          │
│        │ ./data/         │   (persistent, host-mounted)          │
│        │ paulline.db     │                                       │
│        └────────────────┘                                        │
│                                                                  │
│   Host ports:  localhost:3000 (api)   localhost:5173 (web)       │
└─────────────────────────────────────────────────────────────────┘
```

- The browser reaches the web app on `localhost:5173`; from inside the docker network the web container reaches the api as `http://api:3000` (service-name DNS).
- SQLite is a single file on a host-mounted volume so data survives container restarts and is shared with the host `pnpm run db:push` flow.

## Repository Structure

```
paulline/
├── apps/
│   ├── api/                          (NestJS backend — Hexagonal per domain)
│   │   ├── src/
│   │   │   ├── modules/              (one folder per bounded context)
│   │   │   │   ├── auth/             (scaffold → AUTH-001)
│   │   │   │   ├── machines/         (scaffold → MACHINES-001)
│   │   │   │   ├── tunnels/          (scaffold → TUNNELS-001)
│   │   │   │   └── monitoring/       (scaffold → MONITORING-001)
│   │   │   ├── common/               (filters, interceptors, pipes)
│   │   │   ├── config/               (env validation module — Zod)
│   │   │   ├── health/               (health module + controller)
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile.dev
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                          (React frontend — Atomic Design)
│       ├── src/
│       │   ├── components/
│       │   │   ├── atoms/
│       │   │   ├── molecules/
│       │   │   ├── organisms/
│       │   │   ├── templates/
│       │   │   └── pages/
│       │   ├── hooks/
│       │   ├── context/
│       │   ├── utils/
│       │   ├── App.tsx
│       │   ├── index.css             (Tailwind directives)
│       │   └── main.tsx
│       ├── Dockerfile.dev
│       ├── index.html
│       ├── vite.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── database/                     (Prisma + SQLite)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts              (export PrismaClient singleton)
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── schemas/                      (Zod — single source of validation)
│   │   ├── src/
│   │   │   ├── auth.ts               (scaffold)
│   │   │   ├── machines.ts           (scaffold)
│   │   │   ├── tunnels.ts            (scaffold)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── types/                        (TS types inferred from schemas)
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── sdk/                          (PaulineClient — only FE↔BE channel)
│       ├── src/
│       │   ├── PaulineClient.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── harness/                          (docs, specs, backlog, progress)
├── docker-compose.yml
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .env.example
├── .mcp.json
├── .gitignore
├── README.md
├── CLAUDE.md
└── package.json                      (root — scripts + shared dev tooling)
```

## Dependency Graph (workspace packages)

```
            @paulline/schemas  (Zod source of truth)
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
  @paulline/types       (validation reused directly)
        │
        ▼
  @paulline/sdk  ──────────────────────────► consumed by apps/web
        ▲
        │
  @paulline/database  ────────────────────► consumed by apps/api
```

- Direction is strictly one-way to avoid circular deps: `schemas → types → sdk`.
- `apps/api` depends on `@paulline/database`, `@paulline/schemas`, `@paulline/types`.
- `apps/web` depends on `@paulline/sdk`, `@paulline/schemas`, `@paulline/types`.
- No package depends on an `app`; apps are leaves of the graph.

## Docker Compose Architecture

- **api service**
  - Build: `apps/api/Dockerfile.dev` (Node LTS base, `pnpm install`, `pnpm --filter api start:dev`).
  - Port: `3000:3000`.
  - Volumes: `./apps/api/src → /app/apps/api/src` (hot reload), `./data → /app/data` (SQLite), plus `packages/*/src` mounts so workspace source changes propagate. `node_modules` is **not** bind-mounted (kept inside the image).
  - Environment: `NODE_ENV`, `DATABASE_URL`, `API_PORT`.
  - Network: `paulline`.
- **web service**
  - Build: `apps/web/Dockerfile.dev` (Node LTS base, `pnpm install`, `pnpm --filter web dev --host`).
  - Port: `5173:5173`.
  - Volumes: `./apps/web/src → /app/apps/web/src` (HMR), workspace `packages/*/src` mounts.
  - Environment: `VITE_API_URL=http://api:3000`.
  - Network: `paulline`.
  - `depends_on: [api]` (start order only; not a readiness guarantee).
- **Database**
  - SQLite file at `./data/paulline.db`, host-mounted at `./data`. No dedicated container; the file is owned by the api service and persisted on the host.
- **Network**: a single user-defined bridge network named `paulline` so containers resolve each other by service name.

## Environment Variables (.env.example)

```
NODE_ENV=development
DATABASE_URL=file:./data/paulline.db
API_PORT=3000
WEB_PORT=5173
VITE_API_URL=http://localhost:3000
```

- All env access in the api goes through the **Zod-validated config module** (`apps/api/src/config`), never `process.env` directly.
- Vite exposes only `VITE_`-prefixed variables to the browser.
- `DATABASE_URL` is consumed both by Prisma (host `db:push`) and the api container; the relative `file:` path resolves against the working dir in both contexts (`./data`).

## pnpm-workspace.yaml Configuration

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- Root `package.json` holds shared dev tooling (TypeScript, ESLint, Prettier, Vitest) and orchestration scripts that fan out with `pnpm -r` / `pnpm --filter`.
- Hoisting enabled (default) for deduplication; internal packages referenced via `workspace:*`.

## tsconfig Strategy

- **`tsconfig.base.json`** (root): `strict: true`, `target: ES2022`, `module: NodeNext`/`bundler` as appropriate, `esModuleInterop`, `skipLibCheck`, shared `paths` aliases for `@paulline/*`.
- Each workspace `tsconfig.json` `extends` the base and adds its own `rootDir`/`outDir`/`include` plus environment-specific `lib` (DOM for web, Node for api/packages).
- Path aliases (`@paulline/schemas`, `@paulline/types`, `@paulline/sdk`, `@paulline/database`) resolve to workspace `src` in dev and to published types after build.

## Hot Reload Setup

- **Backend (NestJS):** `nest start --watch` (SWC/ts) inside the container; the `src` bind mount feeds file changes into the watcher → rebuild < 5s (satisfies FR-7).
- **Frontend (React):** Vite HMR out of the box; `--host` flag binds `0.0.0.0` so the host browser reaches the container.
- `node_modules` stays inside the image (not bind-mounted) to keep installs fast and avoid host/container platform mismatches.

## Prisma Integration

- Schema lives in `packages/database/prisma/schema.prisma`, `provider = "sqlite"`, `url = env("DATABASE_URL")`.
- Initial models are **scaffolds only** (structure to be detailed in their feature specs): `User`, `Machine`, `Tunnel`, `UptimeRecord`.
- `pnpm run db:generate` produces the client; `pnpm run db:push` creates/syncs the SQLite file under `./data`.
- `packages/database/src/index.ts` exports a single `PrismaClient` instance; the api imports it via `@paulline/database` (no direct ORM access from feature code; domain entities will map explicitly per Hexagonal rules).

## Edge Cases & Risks

| Case | Handling |
|---|---|
| `./data` dir missing on first `db:push` | Document creating it (or Prisma creates the file); README troubleshooting note. |
| Port 3000 / 5173 already in use | `API_PORT` / `WEB_PORT` overridable via `.env`; documented in README. |
| Host `node_modules` leaking into container | Anonymous/named volume or image-internal `node_modules`; never bind-mount it. |
| SQLite path differs host vs container | Both resolve `file:./data/...` against their working dir; volume mount aligns them. |
| Workspace circular deps | Enforced one-way graph `schemas → types → sdk`; verified by `pnpm -r build`. |
| `web` starts before `api` ready | `depends_on` for order only; web tolerates api not-yet-up (dev proxy retries on request). |
```
