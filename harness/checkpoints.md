# Checkpoints — Criterios de Estado Final Paulline

Checklist para auto-evaluación y reviewer: "¿está listo para cerrar?"

## Checkpoint: Feature `done`

- ✅ **Spec aprobada** (APPROVAL gate pasado)
- ✅ **Tests verdes:** `pnpm test` y `pnpm test:e2e` pasan (si aplica)
- ✅ **Acceptance criteria cumplidos** (100%, no parciales)
- ✅ **Code review aprobado** (APPROVED status)
- ✅ **Build pasa:** `pnpm build` sin errores
- ✅ **Lint pasa:** `pnpm lint` sin warnings
- ✅ **TypeScript:** sin errores (`pnpm run type-check`)
- ✅ **Documentación actualizada:**
  - [ ] README.md si cambio de setup
  - [ ] `harness/docs/architecture.md` si cambio de design
  - [ ] `harness/progress/current.md` con resumen
- ✅ **Commit único, semántico:** Conventional Commits, no `Co-Authored-By`
- ✅ **Coverage > 80%** (lógica crítica)
- ✅ **Sin TODOs/FIXMEs pendientes en código** (o documentados en backlog)

## Checkpoint: Commit antes de push

- ✅ `git status` limpio (nada uncommitted)
- ✅ Commit message es descriptivo (no "fix", "update", "wip")
- ✅ Una sola feature por commit
- ✅ Archivos del arnés (`harness/progress/current.md`, etc.) viajan en el commit
- ✅ No secrets en el commit (grep por `CLOUDFLARE_API_KEY`, etc.)
- ✅ `git log` muestra historia lineal (rebase, no merge)

## Checkpoint: Push

- ✅ Humano da OK explícito ("push", "go", similar)
- ✅ Remote es correcto (`origin = https://github.com/pauldvlp/paulline`)
- ✅ Branch es `main`
- ✅ No hay conflictos con remote

## Checkpoint: Milestone (v0.1 MVP completo)

- ✅ Auth Cloudflare (API key) funcional
- ✅ CRUD máquinas (agregar, validar SSH, eliminar) funcional
- ✅ CRUD tuneles (crear, editar, eliminar, pausar/reanudar) funcional
- ✅ Dashboard con status + uptime 24h funcional
- ✅ SDK PaulineClient agnóstico y documentado
- ✅ Dockerización completa (`docker-compose up` funciona)
- ✅ Tests E2E para flujos críticos
- ✅ Documentación: README, architecture, conventions
- ✅ GitHub repo públic, primer release v0.1

## Checkpoint: Release (GitHub)

- ✅ Changelog actualizado (qué nuevas features, qué fixes)
- ✅ Version bump (`v0.1.0`, semantic versioning)
- ✅ Docker image publicada (si aplica)
- ✅ README en repo es claro + setup instructions
- ✅ Contributing.md para devs que quieran aportar

---

## Tabla: Estados de feature

| Estado | Criterio | Próximo |
|---|---|---|
| `pending` | Spec escrita, no aprobada | spec_author review → `spec_ready` |
| `spec_ready` | Spec OK, abierta approval | Humano aprueba → `in_progress` |
| `in_progress` | Implementación activa | Tests verdes → `in_review` |
| `in_review` | Code review en progreso | Reviewer APPROVED → `APPROVAL (commit)` |
| `APPROVED` | Reviewer OK, abierta approval de commit | Humano OK → `done` |
| `done` | Completado, committeado, pusheado | Próxima feature |
| `blocked` | Esperando algo externo | Mitigation → desbloquear |

---

## Auto-checklist diario (leader)

Cada sesión:

- ✅ Leí `harness/progress/current.md` (dónde estamos)
- ✅ Ejecuté `harness/init.sh` (toolchain valid)
- ✅ Revisé `harness/approvals/pending/` (puertas abiertas)
- ✅ Revisé GitHub Issues backlog (siguiente tarea)
- ✅ No hay features `blocked` sin mitigation documentada
- ✅ `main` branch está actualizada localmente
