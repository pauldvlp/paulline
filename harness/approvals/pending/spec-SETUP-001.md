# Approval (Spec) — SETUP-001: Monorepo & Docker Environment

- **Tipo:** spec
- **Estado:** pending
- **Fecha:** 2026-06-19
- **Feature ID:** SETUP-001
- **Bloquea:** Todas las features de v0.1 (feature fundacional)

## Artefactos de la spec

- `harness/specs/SETUP-001/requirements.md` (existente — EARS / FR-1…FR-7)
- `harness/specs/SETUP-001/design.md` (nuevo)
- `harness/specs/SETUP-001/tasks.md` (nuevo — 10 tareas discretas)

## Resumen de la propuesta

Monorepo pnpm con:

- **apps/**: `api` (NestJS, Hexagonal por dominio) + `web` (React + Vite, Atomic Design + Tailwind/shadcn).
- **packages/**: `database` (Prisma + SQLite), `schemas` (Zod, fuente única), `types` (inferidos), `sdk` (PaulineClient, único canal FE↔BE).
- **Docker Compose** dev: servicios `api:3000` + `web:5173`, red compartida `paulline`, volúmenes para hot reload, SQLite persistido en `./data`.
- **Grafo de dependencias** unidireccional `schemas → types → sdk` (sin ciclos).
- Env solo vía esquema Zod validado; `.env.example` documentado.

## Decisiones que requieren tu visto bueno

1. **`node_modules` interno a la imagen** (no bind-mount) para evitar mismatch host/contenedor. ¿OK?
2. **SQLite sin contenedor dedicado** (archivo host-mounted en `./data`). ¿OK para v0.1?
3. **Modelos Prisma scaffold-only** (User, Machine, Tunnel, UptimeRecord) — estructura se detalla en cada feature spec. ¿OK?
4. **`harness/docs/DEVELOPMENT.md`** como guía nueva (Task 9). ¿Lo quieres en esa ruta?

## Checklist de gate

- [ ] Requirements (EARS) revisados
- [ ] Design revisado (arquitectura, estructura, Docker, Prisma, edge cases)
- [ ] Tasks revisadas (discretas, AC verificables, trazan a FRs)
- [ ] Decisiones 1–4 resueltas
- [ ] **OK humano** → mover a `resolved/spec-SETUP-001-APPROVED.md` y pasar feature a `in_progress`
