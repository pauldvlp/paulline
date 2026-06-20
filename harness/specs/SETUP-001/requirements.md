# Requirements — SETUP-001: Monorepo & Docker Environment

## Context

Foundation feature enabling local development for all other v0.1 features.

## Functional Requirements

### FR-1: Developer can install project
- **GIVEN** developer clones repo
- **WHEN** developer runs `pnpm install`
- **THEN** all dependencies resolve without conflicts

### FR-2: Developer can start services via Docker
- **GIVEN** docker-compose.yml configured
- **WHEN** developer runs `docker-compose up -d`
- **THEN** api (port 3000) + web (port 5173) start without errors

### FR-3: Frontend loads
- **GIVEN** services running
- **WHEN** developer navigates to http://localhost:5173
- **THEN** React app loads successfully

### FR-4: Backend health check works
- **GIVEN** services running
- **WHEN** GET http://localhost:3000/health
- **THEN** returns 200 + JSON

### FR-5: Database schema initialized
- **GIVEN** Prisma schema defined
- **WHEN** developer runs `pnpm run db:push`
- **THEN** SQLite database created with schema

### FR-6: Environment variables configured
- **GIVEN** .env.example exists
- **WHEN** developer creates .env
- **THEN** services read NODE_ENV, DATABASE_URL, ports

### FR-7: Hot reload works
- **GIVEN** services running
- **WHEN** TypeScript code modified
- **THEN** rebuild/reload within 5 seconds

## Non-Functional Requirements

- Setup time < 5 minutes
- No external credentials needed
- Disk footprint < 2GB
- Clear error messages

## Acceptance Criteria

- [ ] Monorepo: apps/{api,web}, packages/{database,sdk,schemas,types}
- [ ] pnpm-workspace.yaml configured
- [ ] docker-compose.yml with api + web services
- [ ] .env.example with required variables
- [ ] pnpm install succeeds
- [ ] docker-compose up -d starts both services
- [ ] curl http://localhost:3000/health → 200
- [ ] http://localhost:5173 loads React app
- [ ] pnpm run db:push initializes SQLite
- [ ] Code changes trigger hot reload
- [ ] README with setup steps
- [ ] harness/init.sh passes

## Scope

- Monorepo setup (pnpm workspaces)
- Docker Compose (development)
- TypeScript configs
- Prisma schema + migration
- Environment template
- Hot reload

## Non-Scope

- Production Docker (v0.2)
- K8s (v2)
- CI/CD (v0.2)
- Database seeding (v1)

## Dependencies

- Blocking: None (foundation)
- Enables: All other features
