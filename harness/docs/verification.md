# Verificación — Gates de Cierre Paulline

Antes de marcar una feature `done`, verifica estos gates (no es solo "código compiló").

## Gate 1: Spec (antes de implementar)

- ✅ Requirements escritos en formato EARS (GIVEN/WHEN/THEN)
- ✅ Design explica arquitectura + APIs + edge cases
- ✅ Tasks son discretas (1 responsabilidad por task)
- ✅ Acceptance criteria son específicos y verificables
- ✅ Feature spec aprobada por humano (APPROVAL gate)

## Gate 2: Code Quality

- ✅ **Cobertura de tests:** > 80% en lógica de dominio/aplicación
  - Unit tests (servicios, casos de uso, adaptadores)
  - Integration tests (endpoints, SDK)
  - E2E tests (flujos críticos de usuario)
- ✅ **TS compilation:** sin errores (`pnpm run build`)
- ✅ **Linting:** `pnpm run lint` pasa
- ✅ **No `any` sin justificar:** si hay, comentar **por qué**
- ✅ **Nombres claros:** variables, funciones, clases descriptivas (refactorizar si `temp`, `data`, `stuff`)
- ✅ **Hexagonal (backend):** dominio aislado, puertos interfaces, adaptadores desacoplados
- ✅ **Atomic Design (frontend):** componentes en capas (atoms → molecules → organisms), sin saltos
- ✅ **SDK agnóstico:** métodos chainable (Supabase-like), tipos públicos bien definidos

## Gate 3: Funcionalidad (contra spec)

**Antes de marcar `in_review`, implementer verifica:**

- ✅ ¿Cada acceptance criterion del spec está cumplido?
  - Ejecutar tests E2E si aplica (login → crear recurso → ver en dashboard)
- ✅ ¿Hay casos edge no contemplados en la spec?
  - Si sí: documentar en task, o si es crítico, pedir approval de cambio
- ✅ ¿El comportamiento de error es claro?
  - Mensajes de error son específicos (no genéricos)
- ✅ ¿El usuario/dev entiende qué sucedió?
  - Logging es suficiente (no verbose, no silencioso)

## Gate 4: Integración

- ✅ **SDK:** si es cambio de backend, ¿el SDK se actualizó? ¿Frontend lo usa?
- ✅ **Types:** ¿los tipos se actualizaron en `packages/types`?
- ✅ **Schemas:** ¿se validó contra Zod schema centralizado?
- ✅ **BD:** si hay cambios Prisma, ¿migraciones versionadas? ¿aplican limpio?
- ✅ **Docs:** ¿se actualizó `harness/docs/architecture.md` o `conventions.md` si hay cambios de design?

## Gate 5: Reviewability

**El reviewer (no tú) verifica esto:**

- ✅ **Diff legible:** cambios son claros, commits son semánticos (1 por feature)
- ✅ **Spec adherence:** ¿el código implementa la spec, ni más ni menos?
- ✅ **Tests son asertivos:** no solo "el código se ejecuta", sino "devuelve el resultado esperado"
- ✅ **Comentarios son necesarios:** código lo cuenta; si necesita comentario, refactoriza primero
- ✅ **Archivos del arnés viajan:** `harness/progress/current.md` se actualizó, spec viaja en el commit

## Gate 6: Security (si aplica)

- ✅ **No secrets en código** (API keys, tokens en comentarios)
- ✅ **Validación de entrada:** backend valida contra Zod; no confía en cliente
- ✅ **SQL Injection:** Prisma parametriza; nunca raw SQL
- ✅ **XSS:** React escapa por defecto; nada de `dangerouslySetInnerHTML` salvo justificación
- ✅ **Auth check:** endpoints verifican token/session antes de procesar

## Gate 7: Performance (si aplica)

- ✅ **DB queries:** índices en campos de búsqueda (machine.ip, tunnel.domain); lazy-load relaciones
- ✅ **Frontend:** componentes costosos están memoizados; lazy-loading de routes
- ✅ **API:** rate-limiting en endpoints externos (Cloudflare); cache para datos estables
- ✅ **Bundle size:** verifica que librerías grandes se tree-shaken (no importar de forma innecesaria)

## Gate 8: Documentation

- ✅ **README.md actualizado** (si es cambio de setup)
- ✅ **Arquitectura:** si cambios de design, actualizar `harness/docs/architecture.md`
- ✅ **API:** si cambios de endpoints, documentar en spec o tests (tests sirven de doc)
- ✅ **Progress:** `progress/current.md` clarifica qué se hizo, qué quedó, next steps

---

## Cómo ejecutar verificación

### Antes de `in_review` (Implementer)

```bash
# Tests
pnpm test
pnpm test:e2e

# Build
pnpm build

# Lint
pnpm lint

# Coverage (opcional pero recomendado)
pnpm test --coverage
```

### Antes de `APPROVED` (Reviewer)

1. Leer spec (`harness/specs/<id>-<name>/requirements.md`)
2. Clonar rama / ver diff
3. Correr tests localmente
4. Verificar contra gates (1-8 arriba)
5. Validar que aceptance criteria están cumplidos
6. Escribir review con hallazgos (si los hay) o aprobación

### Si hay bloqueos

Marca feature `blocked`, documenta en `progress/current.md`:
```
**Blocker:** Cannot test Cloudflare API integration locally (requires API key).
**Mitigation:** Mocked Cloudflare adapter for unit tests; E2E testing on staging.
**Next:** Await developer manual E2E validation.
```

---

## Ejemplo: Verificación de feature "Create Machine"

**Spec:** User → enter IP + validate SSH → add machine

**Gate 1: Spec** ✅
- Requirements: user autenticado, ingresa IP, valida SSH (key-based), crea máquina
- Design: NestJS endpoint, SSH adapter, Prisma model
- Tasks: 1) SSH validator, 2) API endpoint, 3) Frontend form, 4) Tests

**Gate 2: Code Quality** ✅
- Tests: `SshValidator` unit tests, `MachineService` tests, API integration tests, frontend E2E
- TS compiles, lint pases, no `any`, nombres claros
- Hexagonal: SshValidator es puerto, adaptador SSH en infrastructure

**Gate 3: Funcionalidad** ✅
- Can user add machine? ✅ (E2E test: POST /machines + form submit)
- SSH validation works? ✅ (unit tests con mocks de SSH)
- Dashboard shows new machine? ✅ (E2E)

**Gate 4: Integración** ✅
- SDK updated? ✅ `paulline.machines().add()`
- Types updated? ✅ Machine type exported from @paulline/types
- DB migrated? ✅ machines table exists

**Gate 5: Reviewability** ✅
- Diff clear? ✅ 1 commit, semantic messages
- Tests are real? ✅ Assert actual behavior, not just "code ran"

**Gate 6: Security** ✅
- No hardcoded SSH keys? ✅ (user provides via form)
- Input validated? ✅ (IP format, hostname length)

**Gate 7: Performance** ✅
- No N+1 queries? ✅ (Prisma select fields, not all)
- SSH timeout reasonable? ✅ (5s default, configurable)

**Gate 8: Documentation** ✅
- Updated progress? ✅ Documented in `progress/current.md`

→ **APPROVED** ✅
