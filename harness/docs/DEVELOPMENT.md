# Development Guide

How the Paulline monorepo is organized and how to extend it. Read this before adding a feature, package, or module.

## Apps vs Packages

- **`apps/*`** are runnable applications and the leaves of the dependency graph. Nothing depends on an app.
  - `apps/api` — NestJS backend.
  - `apps/web` — React + Vite frontend.
- **`packages/*`** are shared libraries consumed by the apps.
  - `@paulline/schemas` — Zod schemas (single source of validation).
  - `@paulline/types` — TypeScript types inferred from schemas.
  - `@paulline/sdk` — PaulineClient, the only frontend ↔ backend channel.
  - `@paulline/database` — Prisma schema + a single PrismaClient instance.

### Dependency direction (strictly one-way, no cycles)

```
schemas → types → sdk            (consumed by apps/web)
schemas, types, database         (consumed by apps/api)
```

`pnpm -r build` enforces the order automatically.

### How packages are consumed

Each package exposes a conditional export:

- `development` → `./src/index.ts` (raw source — used by Vite HMR and `nest start --watch`).
- `default` / `types` → `./dist` (compiled JS + `.d.ts` — used by production builds and `tsc`).

Run `pnpm run build` once so the `dist` outputs exist; the api resolves `@paulline/*` from `dist` at build time, while Vite reads source directly for instant HMR.

## Backend: Hexagonal Architecture (per domain)

Each bounded context under `apps/api/src/modules/<context>/` is split into three layers with a strict inward dependency rule:

```
modules/<context>/
├── domain/          # entities, value objects, ports (type-only interfaces), errors
├── application/     # use-case services + DTOs — depend only on ports
└── infrastructure/  # adapters, controllers, ORM mapping — implement the ports
```

Rules:

- Direction is **domain → application → infrastructure**, never backwards.
- Ports are `type` declarations in `domain`; adapters live in `infrastructure`.
- Domain entities are **not** the Prisma models — map explicitly between them.
- Environment access goes only through the Zod-validated config module (`apps/api/src/config`), never `process.env` directly.

Shared building blocks:

- `apps/api/src/common/` — filters, interceptors, pipes.
- `apps/api/src/config/` — env validation + `ConfigService`.
- `apps/api/src/health/` — reference module (`GET /health`).

## Frontend: Atomic Design

Components under `apps/web/src/components/` are layered by composition level:

```
atoms → molecules → organisms → templates → pages
```

Rules:

- Use shadcn/ui components; only build a custom component when shadcn does not provide one.
- Tailwind utilities only; CSS classes and UI copy stay inline in the JSX (do not extract them to constants).
- All backend calls go through the PaulineClient SDK — never scattered `fetch`/HTTP.

Support folders: `hooks/`, `context/`, `utils/`, `test/`.

## Validation & Types: one source

1. Define the schema in `@paulline/schemas` with Zod.
2. Derive its type in `@paulline/types` via `z.infer`.
3. Reuse both on the backend and frontend — never redefine a shape.

Closed sets use `const ... as const` plus a derived type (no TS `enum`, no native DB enum).

## Step-by-step recipes

### Add a shared schema

1. Create `packages/schemas/src/<name>.ts` with the Zod schema (one artifact per file).
2. Re-export it from `packages/schemas/src/index.ts`.
3. Add the inferred type to `packages/types/src/index.ts`.
4. `pnpm --filter @paulline/schemas build && pnpm --filter @paulline/types build`.

### Add an SDK resource

1. Add a fluent accessor to `packages/sdk/src/PaulineClient.ts` returning a `ResourceClient`.
2. Type its record / input shapes from `@paulline/types`.
3. `pnpm --filter @paulline/sdk test`.

### Add a backend module

1. `mkdir apps/api/src/modules/<context>/{domain,application,infrastructure}`.
2. Define ports + entities in `domain`, use cases in `application`, controllers/adapters in `infrastructure`.
3. Register the module in `apps/api/src/app.module.ts`.
4. Write the test first (TDD), then implement.

### Add a frontend component

1. Place it in the correct atomic layer under `apps/web/src/components/`.
2. Compose from shadcn/ui primitives.
3. Co-locate a Testing Library test.

### Change the database schema

1. Edit `packages/database/prisma/schema.prisma`.
2. `pnpm run db:generate` then `pnpm run db:push`.
3. Map Prisma models to domain entities inside the relevant backend module — do not leak ORM models into the domain.

## Testing

- Unit tests run with Vitest (`*.test.ts` / `*.test.tsx`), co-located with the code.
- `pnpm test` runs every workspace's tests; `pnpm --filter <pkg> test` scopes to one.
- TDD is mandatory: red → green → refactor.

## Environment variables

Defined in `.env.example` and validated by the api's Zod config module:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `production` / `test`. |
| `DATABASE_URL` | SQLite file path (api runtime). |
| `API_PORT` | Backend port. |
| `WEB_PORT` | Frontend dev server port. |
| `VITE_API_URL` | API URL exposed to the browser / Vite proxy. |

The Prisma CLI reads `packages/database/.env` (see `.env.example` there); its relative SQLite path resolves against the schema directory and lands at the repo-root `./data`.
