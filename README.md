# Paulline

Centralized panel to orchestrate Cloudflare tunnels from multiple remote machines (SSH).

## Vision

Expose services from multiple machines (home server, cloud instance, local dev) under a single Cloudflare domain, without manual configuration per machine.

**v0.1 MVP:** Dashboard for auth, machine management (SSH key-based), tunnel CRUD, status + 24h uptime monitoring.

## Stack

- **Backend:** NestJS + TypeScript (Hexagonal Architecture)
- **Frontend:** React + Vite + TypeScript (Atomic Design)
- **SDK:** PaulineClient (Supabase-like, fluent API) — the only frontend ↔ backend channel
- **Database:** Prisma + SQLite
- **Validation:** Zod (single source of truth, shared back/front)
- **Testing:** Vitest + Testing Library
- **Monorepo:** pnpm workspaces
- **Containers:** Docker Compose (development)

## Project Structure

```
paulline/
├── apps/
│   ├── api/          # NestJS backend (Hexagonal per domain)
│   └── web/          # React + Vite frontend (Atomic Design)
├── packages/
│   ├── database/     # Prisma schema + PrismaClient singleton
│   ├── schemas/      # Zod validation (single source of truth)
│   ├── types/        # TS types inferred from schemas
│   └── sdk/          # PaulineClient SDK
├── harness/          # Product docs, specs, backlog, progress
├── data/             # SQLite database (host-mounted, gitignored)
├── docker-compose.yml
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Getting Started

Full setup takes under 5 minutes and needs no external credentials.

### Prerequisites

- Node.js LTS (>= 20)
- pnpm (>= 11)
- Docker + Docker Compose

### Setup

```bash
# 1. Install dependencies (links workspace packages)
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Initialize the SQLite database (creates ./data/paulline.db)
pnpm run db:push

# 4. Boot the development stack (api on :3000, web on :5173)
docker compose up -d
```

Then open:

- Web app: http://localhost:5173 → renders "Hello Paulline"
- API health: http://localhost:3000/health → `{ "status": "ok", "timestamp": "..." }`

### Local (non-Docker) development

```bash
# Build workspace packages (api resolves @paulline/* from their dist output)
pnpm run build

# Run an app directly with watch / HMR
pnpm --filter @paulline/api start:dev
pnpm --filter @paulline/web dev
```

### Common scripts

```bash
pnpm run dev          # run all apps in parallel (watch / HMR)
pnpm run build        # build every workspace package
pnpm test             # run all unit tests (Vitest)
pnpm run typecheck    # tsc --noEmit across the workspace
pnpm run db:generate  # regenerate the Prisma client
pnpm run db:push      # sync the SQLite schema
```

## Hot Reload

- **Backend:** `nest start --watch` rebuilds on file change (< 5s) via the bind-mounted `src`.
- **Frontend:** Vite HMR (the dev server binds `0.0.0.0` so the host browser reaches the container).

Both work out of the box with `docker compose up -d` — edit a file under `apps/*/src` and the change is reflected without a manual restart.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Port 3000 / 5173 already in use | Set `API_PORT` / `WEB_PORT` in `.env`. |
| `./data` missing on first run | `pnpm run db:push` creates it; or `mkdir data`. |
| Prisma client out of date | `pnpm run db:generate`. |
| Containers can't reach each other | They share the `paulline` network; the web app reaches the api at `http://api:3000`. |
| `pnpm install` build-script warnings | Native deps (Prisma, esbuild) are allowlisted in `pnpm-workspace.yaml` under `onlyBuiltDependencies`. |

## Documentation

- **Vision & Roadmap:** `harness/product/{vision,roadmap,charter}.md`
- **Architecture:** `harness/docs/architecture.md`
- **Conventions:** `harness/docs/conventions.md`
- **Development guide:** `harness/docs/DEVELOPMENT.md`
- **Specs & SDD:** `harness/docs/specs.md`
- **Verification gates:** `harness/docs/verification.md`

## License

MIT (open source)
