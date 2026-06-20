# Backlog — Fuente de Verdad

El backlog de Paulline vive en **GitHub Issues** (adapter elegido en decisiones técnicas).

## Cómo usar

1. **Crear feature:** Abre issue en github.com/pauldvlp/paulline/issues
   - Título: `[v0.1] Add Cloudflare API authentication`
   - Body: descripción breve (problema, valor, AC)
   - Label: `type:feature` (o `type:bug`, `type:docs`)
   - Milestone: `v0.1 MVP`
   - Assignee: dev que la implemente

2. **Priorizar:** Label `priority:high`, `priority:medium`, `priority:low`

3. **Workflow de feature:**
   - `pending` → issue abierto
   - `spec_ready` → spec escrita (link en issue)
   - `in_progress` → issue asignado
   - `in_review` → PR abierto
   - `done` → issue cerrado + commit mergeado

## Backlog Inicial (v0.1 MVP)

Será detallado en próxima sesión (Fase 5):

1. Setup — Monorepo, toolchain, Docker
2. Auth — Cloudflare API key
3. Machines — CRUD, SSH validator
4. Tunnels — CRUD, Cloudflare integration
5. Monitoring — Uptime checker
6. Dashboard — UI, status, uptime gráficas
7. Polish — Tests, docs, GitHub release

Ver `harness/product/charter.md` para alcance y NON-GOALS de v0.1.
